import Firebase from "./Firebase";
/**
 * handles all interactions with firebase object
 */
//TODO: Logan I was going to go fix the warnings but decided to wait on this file.
class FirebaseInteraction {
  /**
   * initializes authentication state after refresh, or when a page first loads.
   * local storage is used to persist login state
   */
  constructor() {
    Firebase.auth()
      .setPersistence(Firebase.auth.Auth.Persistence.SESSION)
      .then(() => {});
    let authenticated = sessionStorage.getItem("authenticated");
    if (authenticated) {
      this.authenticated = JSON.parse(authenticated);
    } else {
      this.authenticated = false;
    }
    let admin = sessionStorage.getItem("admin");
    if (admin) {
      this.admin = JSON.parse(admin);
    } else {
      this.admin = false;
    }
    let user = sessionStorage.getItem("user");
    if (user) {
      this.userId = user;
    } else {
      this.userId = null;
    }
    let businessType = sessionStorage.getItem("businessType");
    if (businessType) {
      this.businessType = businessType;
    } else {
      this.businessType = null;
    }
  }

  /**
   * logs a user in with given email and password
   *
   * @param {string} email email submitted during sign-in
   * @param {string} password password entered during sign-in
   * @param {function} cb a function called after login is complete
   */
  login(email, password, cb) {
    Firebase.auth()
      .signInWithEmailAndPassword(email, password)
      .then(cred => {
        cred.user.getIdTokenResult().then(tokenResult => {
          if (tokenResult.claims.admin) {
            sessionStorage.setItem("admin", true);
            this.admin = true;
          } else {
            sessionStorage.setItem("admin", false);
            this.admin = false;
          }
          sessionStorage.setItem("authenticated", true);
          this.authenticated = true;
          sessionStorage.setItem("user", cred.user.uid);
          this.userId = cred.user.uid;

          if (!this.isAdmin()) {
            //before calling cb, deactivate all expired coupons for company
            this.getUserAccountDetailsSLOW((account, error) => {
              if (error) {
                this.logout(() => {
                  cb(error);
                });
              } else if (!account) {
                this.logout(() => {
                  cb(Error("the user's data has been deleted"));
                });
              } else {
                sessionStorage.setItem("businessType", account.businessType);
                this.businessType = account.businessType;
                let coupons = account.coupons;
                this.deactivateExpiredCoupons(coupons, account, error => {
                  if (error) {
                    alert("error with coupon expirations: " + error.message);
                  } else {
                    this.deleteExpiredPaymentPlan(account, error => {
                      if (error) {
                        alert("error with payment plan: " + error.message);
                      } else {
                        cb();
                      }
                    });
                  }
                });
              }
            });
          } else {
            cb();
          }
        });
      })
      .catch(error => {
        cb(error);
      });
  }

  deleteExpiredPaymentPlan(data, cb) {
    if (data.monthlyPayment !== 0) {
      let now = Date.now();
      if (data.paymentExpiration < now) {
        //payment plan is expired
        const collectionRef = Firebase.database().ref(
          data.businessType + "/" + this.getUserId()
        );
        collectionRef
          .update({ monthlyPayment: 0, paymentExpiration: null })
          .then(snap => {
            cb();
          })
          .catch(e => cb(e));
      } else {
        cb();
      }
    } else {
      cb();
    }
  }

  deactivateExpiredCoupons(coupons, data, cb) {
    if (coupons) {
      let now = Date.now();
      coupons.forEach(coupon => {
        if (coupon.expTimestamp < now) {
          //coupon should be deactivated
          coupon.active = false;
        }
      });
      let couponsRef = Firebase.database().ref(
        data.businessType + "/" + this.getUserId() + "/coupons"
      );
      couponsRef
        .set(coupons)
        .then(snap => {
          cb();
        })
        .catch(e => cb(e));
    } else {
      cb();
    }
  }

  /**
   * logs the current user out
   *
   * @param {function} cb a function called after logout is complete
   */
  logout(cb) {
    Firebase.auth()
      .signOut()
      .then(() => {
        sessionStorage.setItem("authenticated", false);
        sessionStorage.setItem("admin", false);
        sessionStorage.setItem("user", null);
        sessionStorage.setItem("businessType", null);
        this.authenticated = false;
        this.admin = false;
        this.userId = null;
        this.businessType = null;
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * @return true if a user is signed in(including admin), false otherwise
   */
  isAuthenticated() {
    return this.authenticated;
  }

  /**
   * @return true if user is an admin, false otherwise
   */
  isAdmin() {
    return this.admin;
  }

  /**
   * @return the unique UID created by firebase for the user currently signed in
   */
  getUserId() {
    return this.userId;
  }

  /**
   * @return the user's business type. This helps speed up database navigation
   */
  getBusinessType() {
    return this.businessType;
  }

  /**
   * deletes the user's account from the database. This should only be called if
   * there was an error in some step while creating a user's account, so they
   * will be able to reuse the same email and try again
   *
   * @param {function} cb a function called after deletion is complete
   */
  deleteUserAccount(cb) {
    let uid = this.getUserId();
    let collectionRef = Firebase.database().ref(
      this.getBusinessType() + "/" + uid
    );
    collectionRef
      .remove()
      .then(() => {
        let storageRef = Firebase.storage().ref(uid);
        let deletePromises = [];
        storageRef.listAll().then(folder => {
          folder.items.forEach(fileRef => {
            deletePromises.push(fileRef.delete());
          });
        });
        Promise.all(deletePromises)
          .then(results => {
            Firebase.auth()
              .currentUser.delete()
              .then(() => {
                cb();
              });
          })
          .catch(e => cb(e));
      })
      .catch(e => cb(e));
  }

  /**
   * sends a password reset link to given email
   *
   * @param {string} email the email to send the link to
   * @param {function} cb a function called after email is sent
   */
  sendPasswordResetEmail(email, cb) {
    Firebase.auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        cb();
      })
      .catch(e => {
        cb(e);
      });
  }

  /**
   * retrieves user's account info from db, including coupons, and sends it
   * to callback function. This is only used when logging in because it must
   * iterate over the database until the account is found, whereas the method
   * below is used for all other cases
   *
   * @param {function} cb a function called after retrieval is complete
   */
  getUserAccountDetailsSLOW(cb) {
    const database = Firebase.database().ref();
    database
      .once("value", snapshot => {
        let account = null;
        //iterate over all business types
        snapshot.forEach(type => {
          //iterate over each business of that type
          type.forEach(business => {
            //found this user's collection
            if (business.key === this.getUserId()) {
              account = business.val();
              account.path = business.ref.path.toString();
              cb(account);
            }
          });
        });
        //if account was not found, it will still be null
        cb(account);
      })
      .catch(e => cb({}, e));
  }

  /**
   * retrieves user's account info from db, including coupons, and sends it
   * to callback function. This does the same thing as the method above,
   * but it requires no iteration because the path to collection is already
   * known
   *
   * @param {function} cb a function called after retrieval is complete
   */
  getUserAccountDetails(cb) {
    const userCollection = Firebase.database().ref(
      this.getBusinessType() + "/" + this.getUserId()
    );
    userCollection
      .once("value", snapshot => {
        let account = snapshot.val();
        account.path = snapshot.ref.path.toString();
        cb(account);
      })
      .catch(e => cb(e));
  }

  /**
   *
   * creates a user in firebase based on data submitted in sign up form.
   * upon completion, calls createUserCollection()
   *
   * @param {object} data the user's info from signup
   * @param {string} password the user's password
   * @param {function} cb a function called after creation is complete
   */
  createUserAccount(data, password, cb) {
    Firebase.auth()
      .createUserWithEmailAndPassword(data.email, password)
      .then(cred => {
        sessionStorage.setItem("businessType", data.businessType);
        this.businessType = data.businessType;
        sessionStorage.setItem("authenticated", true);
        this.authenticated = true;
        sessionStorage.setItem("user", cred.user.uid);
        this.userId = cred.user.uid;

        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * creates a section of database for user, initializing all account info besides verified field.
   *
   * @param {object} data the user's info submitted on sign up
   * @param {function} cb a function called after creation is complete
   */
  createUserCollection(data, cb) {
    //create section in database for user, create empty coupon array
    const userCollection = Firebase.database().ref(
      data.businessType + "/" + this.getUserId()
    );
    userCollection
      //data contains all info from sign up page, adjust as needed
      .set(data)
      .then(() => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * uploads a user's proof of ownership file to storage bucket labeled with their UID
   *
   * @param {object} proof a reference to the file input field for proof of ownership
   * @param {function} cb a function called after upload is complete
   */
  uploadOwnershipProof(proof, cb) {
    const ownershipRef = Firebase.storage().ref(
      this.getUserId() + "/ProofOfOwnership"
    );
    ownershipRef
      .put(proof)
      .then(snap => {
        cb();
      })
      .catch(e => cb(e));
  }
  /**
   * uploads a user's photos to a storage bucket labeled with their UID
   *
   * @param {array} photos an array of react references to the photo selection input fields
   * @param {function} cb a function called after upload is complete
   */
  uploadUserPhotos(photos, cb) {
    let uploadPromises = [];
    let deletePromises = [];
    let uid = this.getUserId();
    photos.forEach(photo => {
      if (Array.isArray(photo)) {
        let currPhotoRef = Firebase.storage().refFromURL(photo[1]);
        deletePromises.push(currPhotoRef.delete());
        let newPhotoRef = Firebase.storage().ref(uid + "/" + photo[0].name);
        uploadPromises.push(newPhotoRef.put(photo[0]));
      } else if (photo && photo.name) {
        let newPhotoRef = Firebase.storage().ref(uid + "/" + photo.name);
        uploadPromises.push(newPhotoRef.put(photo));
      }
    });
    uploadPromises.push(Promise.all(deletePromises));
    Promise.all(uploadPromises)
      .then(snapshots => {
        cb();
      })
      .catch(e => cb(e));
  }
  /**
   * updates a user's list of photo urls stored in database to contents of given urls
   *
   * @param {object} data the user's info submitted on sign up
   * @param {array} urls an array of urls representing this user's photos(excluding owner proof)
   * @param {function} cb a function called after update is complete
   */
  updatePhotoUrls(data, urls, cb) {
    const userCollection = Firebase.database().ref(
      data.businessType + "/" + this.getUserId()
    );
    userCollection
      .update({ photos: urls })
      .then(snap => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * deletes the photo with given url from user's storage bin
   *
   * @param {string} url the url of the photo to be deleted
   * @param {function} cb a function called after deletion is complete
   */
  deleteUserPhoto(url, cb) {
    const fileRef = Firebase.storage().refFromURL(url);
    fileRef
      .delete()
      .then(snap => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * gets a list of urls for the user's current photos and passes them to cb function
   *
   * @param {function} cb a function called after retrieval is complete
   */
  getUserPhotos(cb) {
    let urlPromises = [];
    const userStorage = Firebase.storage().ref(this.getUserId());
    userStorage
      .listAll()
      .then(refs => {
        refs.items.forEach(ref => {
          urlPromises.push(ref.getDownloadURL());
        });
        Promise.all(urlPromises).then(urls => {
          //last photo should be their proof of ownership, so remove it
          for (let i = 0; i < urls.length; i++) {
            if (urls[i].includes("ProofOfOwnership")) {
              urls.splice(i, 1);
              i--;
            }
          }
          cb(urls);
        });
      })
      .catch(e => cb([], e));
  }

  /**
   * updates a user's account information in database based on contents of given data.
   * Photos are handled separately
   *
   * @param {object} data the user's info submitted on account settings page
   * @param {function} cb a function called after update is complete
   */
  updateAccountInfo(data, cb) {
    const userCollection = Firebase.database().ref(
      data.businessType + "/" + this.getUserId()
    );
    userCollection
      .update(data)
      .then(() => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   *
   * @param {object} data the user's account info
   * @param {object} coupon an object containing all the data fields of a coupon
   * @param {function} cb a function called after creation is complete
   */
  createNewCoupon(data, coupon, cb) {
    const userCollection = Firebase.database().ref(
      data.businessType + "/" + this.getUserId()
    );
    userCollection.child("coupons").once("value", snapshot => {
      let coupons = snapshot.val();
      if (!coupons) {
        coupons = [];
      }
      coupons.push(coupon);
      userCollection
        .update({ coupons })
        .then(snap => {
          cb();
        })
        .catch(e => cb(e));
    });
  }

  /**
   * deletes a coupon from current user's collection in db. Note: coupons represents
   * the remaining coupons, not coupons being deleted
   *
   * @param {object} data the user's account info
   * @param {array} coupons an array of coupons to keep in user's collection
   * @param {function} cb a function called after deletion is complete
   */
  deleteCoupon(data, coupons, cb) {
    const userCollection = Firebase.database().ref(
      data.businessType + "/" + this.getUserId()
    );
    userCollection
      .update({ coupons })
      .then(snap => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * updates the coupon at given index in user's collection to contents of
   * given coupon
   *
   * @param {object} data the user's account info
   * @param {object} coupon the new coupon details
   * @param {number} index the index of the coupon to be replaced
   * @param {function} cb a function called after edit is complete
   */
  editCoupon(data, coupon, index, cb) {
    const couponsRef = Firebase.database().ref(
      data.businessType + "/" + this.getUserId() + "/coupons"
    );
    couponsRef
      .update({ [index]: coupon })
      .then(snap => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * submits a request for a new payment plan that can be viewed by admin
   *
   * @param {boolean} isNew true if this is a new payment plan, false if it's
   * an additional payment
   * @param {object} payment the user's payment details
   * @param {function} cb a function called after submission is complete
   */
  submitPaymentRequest(isNew, payment, cb) {
    let uid = this.getUserId();
    payment.uid = uid;
    const paymentRef = Firebase.firestore().doc(
      isNew ? "newPaymentRequests/" + uid : "additionalPaymentRequests/" + uid
    );
    paymentRef
      .set(payment)
      .then(snap => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * submits an advertisement to be displayed as a pop-up in ad.
   * must be activated by admin
   *
   * @param {object} data the information for this ad
   * @param {file} file the image file for this ad
   * @param {function} cb a function called after submission is complete
   */
  submitAdRequest(data, file, cb) {
    this.getUserAccountDetails((account, error) => {
      if (error) {
        cb(error);
      } else {
        data.uid = this.getUserId();
        data.company = account.companyName;
        //add more stuff here as needed for Emmanuel
        const adPhotoRef = Firebase.storage().ref(
          "Advertisements/" + this.getUserId() + "__" + Date.now()
        );
        adPhotoRef
          .put(file)
          .then(() => {
            adPhotoRef.getDownloadURL().then(url => {
              data.imageUrl = url;
              const adCollection = Firebase.database().ref("Advertisements");
              let newAd = adCollection.push();
              console.log(newAd.key);
              data.key = newAd.key;
              newAd
                .set(data)
                .then(() => {
                  cb();
                })
                .catch(e => cb(e));
            });
          })
          .catch(e => cb(e));
      }
    });
  }

  /**
   * deletes the given ad request from db. Can't happen for ads that are already active
   *
   * @param {object} ad the ad to be deleted
   * @param {function} cb a function called after deletion is complete
   */
  deleteAdRequest(ad, cb) {
    const adRef = Firebase.database().ref("Advertisements/" + ad.key);
    adRef
      .remove()
      .then(() => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * gets all ads for the current user, active or not, and passes them to cb
   *
   * @param {function} cb a function called after retrieval is complete
   */
  getAdvertisements(cb) {
    const adsRef = Firebase.database().ref("Advertisements");
    let myAds = [];
    adsRef
      .once("value", snapshot => {
        snapshot.forEach(adId => {
          let ad = adId.val();
          if (ad.uid === this.getUserId()) {
            myAds.push(ad);
          }
        });
        cb(myAds);
      })
      .catch(e => cb([], e));
  }

  /**
   * gets all unactivated advertisements to display on admin page
   *
   * @param {function} cb a function called after retrieval is complete
   */
  getAdRequestsADMIN(cb) {
    const adsRef = Firebase.database().ref("Advertisements");
    let ads = [];
    adsRef
      .once("value", snapshot => {
        snapshot.forEach(ad => {
          let val = ad.val();
          if (!val.active) {
            ads.push(val);
          }
        });
        cb(ads);
      })
      .catch(e => cb([], e));
  }

  /**
   * activates the given ad so that it will appear in the app once its start date
   * arrives
   *
   * @param {object} data the ad to be verified
   * @param {function} cb a function called after verification is complete
   */
  verifyAdRequestADMIN(data, cb) {
    const adRef = Firebase.database().ref("Advertisements/" + data.key);
    adRef
      .update({ active: true })
      .then(() => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * deletes the ad request and corresponding photo from database and storage
   *
   * @param {object} data the ad to be deleted
   * @param {function} cb a function called after deletion is complete
   */
  deleteAdRequestADMIN(data, cb) {
    const photoRef = Firebase.storage().ref(
      "Advertisements/" + data.uid + "__" + data.title
    );
    photoRef
      .delete()
      .then(() => {
        const adRef = Firebase.database().ref("Advertisements/" + data.key);
        adRef
          .remove()
          .then(() => {
            cb();
          })
          .catch(e => cb(e));
      })
      .catch(e => cb(e));
  }

  /**
   * gets an array of all payment requests to be rendered on admin page
   *
   * @param {boolean} new true if this method should retrieve new payment
   * requests, and false if it should retrieve additional payment requests
   *
   * @param {function} cb a function called after retrieval is complete
   */
  getPaymentRequestsADMIN(isNew, cb) {
    const paymentsRef = Firebase.firestore().collection(
      isNew ? "newPaymentRequests" : "additionalPaymentRequests"
    );
    let payments = [];
    paymentsRef
      .get()
      .then(snapshot => {
        snapshot.forEach(request => {
          payments.push(request.data());
        });
        cb(payments);
      })
      .catch(e => cb([], e));
  }

  /**
   * retrieves all accounts from database that haven't been verified, to be rendered
   * on admin home page
   *
   * @param {function} cb a function called after retrieval is complete
   */
  getUnverifiedAccountsADMIN(cb) {
    let userAccounts = [];
    let urlPromises = [];
    let database = Firebase.database().ref();
    //check all user accounts, find ones that haven't been verified
    database
      .once("value", snapshot => {
        //iterate over all business types
        snapshot.forEach(type => {
          type.forEach(business => {
            let accountInfo = business.val();
            if (accountInfo.verified === false) {
              accountInfo.path = business.ref.path;
              let ownerProofRef = Firebase.storage().ref(
                business.ref.path.pieces_[1] + "/ProofOfOwnership"
              );
              urlPromises.push(
                ownerProofRef.getDownloadURL().catch(e => {
                  e.path = business.ref.path;
                  cb({}, e);
                })
              );
              userAccounts.push(accountInfo);
            }
          });
        });
        Promise.all(urlPromises).then(urls => {
          urls.forEach((url, index) => {
            userAccounts[index].proof = url;
          });
          cb(userAccounts);
        });
      })
      .catch(e => cb([], e));
  }
  /**
   * verifies account with given details, allowing that user's coupons to show up
   * on the app
   *
   * @param {object} data account info for user being verified
   * @param {function} cb a funciton called after verification is complete
   */
  verifyAccountADMIN(data, cb) {
    const userCollection = Firebase.database().ref(data.path);
    userCollection
      .update({
        verified: true
      })
      .then(() => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * deletes all a user's data and files from database and storage.
   * Note: doesn't actually delete the user's account because firebase
   * doesn't allow it unless you recently signed in as that user
   *
   * @param {object} data account info for user being deleted
   * @param {function} cb a funciton called after deletion is complete
   */
  deleteUserDataADMIN(data, cb) {
    let collectionRef = Firebase.database().ref(data.path);
    collectionRef
      .remove()
      .then(() => {
        let storageRef = Firebase.storage().ref(data.path.pieces_[1]);
        let deletePromises = [];
        storageRef.listAll().then(folder => {
          folder.items.forEach(fileRef => {
            deletePromises.push(fileRef.delete());
          });
        });
        Promise.all(deletePromises)
          .then(results => {
            cb();
          })
          .catch(e => cb(e));
      })
      .catch(e => cb(e));
  }

  /**
   * verififies a payment plan represented by details. User payment page should now
   * show current plan
   *
   * @param {object} details the payment plan information
   * @param {function} cb a funciton called after verification is complete
   */
  verifyNewPaymentADMIN(details, cb) {
    //replace all commas with empty, remove 'birr' suffix, then parse to a number
    let birr = parseFloat(
      details.amount.replace(/,/g, "").substring(0, details.amount.indexOf(" "))
    );
    let months = parseInt(details.period.substring(0, 2)) / 30;
    let monthlyPayment = parseInt(birr / months);
    let currDate = new Date();
    let expDate = new Date(currDate);
    expDate.setDate(currDate.getDate() + months * 30);
    const userCollection = Firebase.database().ref(
      details.businessType + "/" + details.uid
    );
    userCollection
      .update({
        monthlyPayment,
        paymentExpiration: expDate.getTime()
      })
      .then(snap => {
        //delete request after it's been verified
        this.deletePaymentADMIN(true, details, error => {
          if (error) {
            cb(error);
          } else {
            details.monthlyPayment = monthlyPayment;
            details.paymentExpiration = expDate.toDateString();
            details.verifiedTime = currDate.toString();
            const paymentsRef = Firebase.firestore().doc(
              "payments/" + details.uid
            );
            paymentsRef
              .set(details)
              .then(snap => {
                cb();
              })
              .catch(e => cb(e));
          }
        });
      })
      .catch(e => cb(e));
  }

  /**
   * deletes the given payment request from database
   *
   * @param {boolean} isNew true if this method should delete a new payment
   * request, and false if it should delete an additional payment request
   * @param {object} details the details of the payment request
   * @param {function} cb a function called after deletion is complete
   */
  deletePaymentADMIN(isNew, details, cb) {
    const requestRef = Firebase.firestore().doc(
      isNew
        ? "newPaymentRequests/" + details.uid
        : "additionalPaymentRequests/" + details.uid
    );
    requestRef
      .delete()
      .then(snap => {
        cb();
      })
      .catch(e => cb(e));
  }

  /**
   * verifies an additional payment from a user, calculating a new monthly rate as needed
   *
   * @param {object} details the details of the payment request
   * @param {function} cb a function called after verification is complete
   */
  verifyAdditionalPaymentADMIN(details, cb) {
    let existingPayment = details.currentPayment;

    let newPayment = parseFloat(
      details.amount.replace(/,/g, "").substring(0, details.amount.indexOf(" "))
    );
    let currDate = new Date();
    //getTime returns milliseconds, divide by milliseconds per day
    let daysRemaining = (details.expiration - currDate.getTime()) / 86400000;
    //formula to give multiplier based on days remaining in payment period
    let updatedPayment = parseInt(
      existingPayment + newPayment * (30 / daysRemaining)
    );
    const userCollection = Firebase.database().ref(
      details.businessType + "/" + details.uid
    );
    userCollection
      .update({ monthlyPayment: updatedPayment })
      .then(snap => {
        this.deletePaymentADMIN(false, details, error => {
          if (error) {
            cb(error);
          } else {
            const paymentsRef = Firebase.firestore().doc(
              "payments/" + details.uid
            );
            paymentsRef
              .update({
                monthlyPayment: updatedPayment,
                verifiedTime: currDate.toString(),
                additionalPaymentAccountHolder: details.accountName,
                additionalPaymentAccountNumber: details.accountNumber
              })
              .then(snap => {
                cb();
              })
              .catch(e => cb(e));
          }
        });
      })
      .catch(e => cb(e));
  }
}

export default new FirebaseInteraction();
