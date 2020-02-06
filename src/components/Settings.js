import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import firebase from "./FirebaseInteraction";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar/AppBar";
import { Toolbar } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import SettingsIcon from "@material-ui/icons/Settings";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { geolocated } from "react-geolocated";
import * as Constants from "../Constants/constants";
import * as Styles from "../Constants/Styling";

/**
 * allows user to edit existing information about their account. They can change their
 * operating hours, website, photos, business description, phone number, and address
 */
class Settings extends Component {
  constructor(props) {
    super(props);
    firebase.getUserAccountDetails((account, error) => {
      if (error) {
        alert("error getting account details: " + error.message);
      } else {
        this.setState({ account, submitted: false });
      }
    });
  }

  //bundle of methods for the appbar navigation.
  handleMenu = event => {
    this.setState({ anchor: event.currentTarget });
  };
  handleClose = () => {
    this.setState({ anchor: null });
  };
  openHome = () => {
    this.props.history.push("/home");
  };
  openMyAccount = () => {
    this.props.history.push("/account");
  };
  openPayment = () => {
    this.props.history.push("/payment");
  };
  openAdvertisements = () => {
    this.props.history.push("/advertisements");
  };

  /**
   * handles changing starting and ending hours respectively
   *
   * @param {event} event the event raised when a change is made
   * to input field for hours
   */
  onChangeStartHour = event => {
    this.changeHours(event.target.id.substring(0, 1), 0, event.target.value);
  };
  onChangeEndHour = event => {
    this.changeHours(event.target.id.substring(0, 1), 1, event.target.value);
  };

  /**
   * handles modifying business hours
   *
   * @param {number} day a value between 0 and 6 inclusive, representing a day of the week
   * @param {number} startEnd 0 if modifying opening time, 1 if modifying closing time
   * @param {string} time a time of hours and minutes, in military format
   */
  changeHours = (day, startEnd, time) => {
    console.log(day);
    console.log(startEnd);
    console.log(time);
    const account = this.state.account;
    account.hours[day][startEnd] = time;
    this.setState({ account });
  };

  /**
   * removes photo at given index from the user's account
   *
   * @param {number} index the index of the photo to remove, 1-3 inclusive(cant remove 0)
   *
   */
  removePhoto = index => {
    if (
      window.confirm(
        "Are you sure you want to remove this photo from your account?"
      )
    ) {
      let account = this.state.account;
      let deleteUrl = account.photos.splice(index, 1)[0];
      firebase.deleteUserPhoto(deleteUrl, error => {
        if (error) {
          alert("error deleting photo: " + error.message);
        } else {
          firebase.updatePhotoUrls(account, account.photos, error => {
            if (error) {
              alert("error updating photo information: " + error.message);
            } else {
              this.setState({ account, submitted: false });
            }
          });
        }
      });
    }
  };

  /**
   * returns true if a file is any kind of image, false otherwise.
   *
   * @param {file} file a file selected using form input
   *
   * ALEX: I think this is better than checking extensions because
   * people can manually change extensions, but the "type" field
   * is harder to mess with
   */
  isImage = file => {
    return file.type.split("/")[0] === "image";
  };

  /**
   * returns true if given lat is a valid latitude coordinate, false otherwise
   *
   * @param {string} lat a latitude string
   */
  isLatitude = lat => {
    return isFinite(lat) && Math.abs(lat) <= 90;
  };

  /**
   * returns true if given lng is a valid longitude coordinate, false otherwise
   *
   * @param {string} lng a longitude string
   */
  isLongitude = lng => {
    return isFinite(lng) && Math.abs(lng) <= 180;
  };

  /**
   * returns true if given text has any numbers in it, false otherwise.
   * Used to validate names
   *
   * @param {string} text the text from a text field
   */

  hasNumbers = text => {
    return /\d/.test(text);
  };

  /**
   * returns true if given text has only digits in it, false otherwise.
   * Used to validate phone numbers.
   *
   * @param {string} text the text from a text field
   */
  hasNonNumbers = text => {
    text = text.replace(/[\s()-]+/gi, "");
    return !/^\d+$/.test(text);
  };

  /**
   * Finds the user's location(latitude/longitude), using the React geolocation api. Note that precision can be set.
   *
   * Throws error if user tries to find their location after they denied or ignored the Location Access Request
   */
  findLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const PRECISION = 7;
          const round = Math.pow(10, PRECISION);
          //https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
          //says 5 decimal places (precise up to 1.1m) is equal to commercial GPS with differential correction
          // so 6 (0.11m) should be fine.
          const posLat = String(
            Math.round(pos.coords.latitude * round) / round
          );
          const posLong = String(
            Math.round(pos.coords.longitude * round) / round
          );

          this.setState({ lat: posLat, long: posLong });
        },
        error =>
          alert(
            "Error finding location: " +
              error.message +
              ". Please reload page and allow Location access."
          ),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } else alert("Geolocation not available on this browser.");
  };

  /**
   * signs a user out
   */
  handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      firebase.logout(error => {
        if (error) {
          alert("error logging out");
        } else {
          this.props.history.push("/");
        }
      });
    }
  };

  handleSubmissionError = error => {
    alert("error updating account: " + error.message);
    this.setState({ submitted: false });
  };

  /**
   * sends user back to home page
   */

  goBack = () => {
    this.props.history.push("/home");
  };

  /**
   * handles submission of entire form, passing information collected to firebase object
   *
   * @param {event} event the event generated when form is submitted
   */
  handleSubmit = event => {
    event.preventDefault();
    //validate business photos
    if (window.confirm("Save changes?")) {
      let photos = [];
      for (let i = 0; i < 4; i++) {
        let file = event.target["file" + i].files[0];
        //if there's a file selected and a photo to override
        if (file) {
          if (file.size / 1024 / 1024 > Constants.MAX_FILE_SIZE) {
            alert(
              "Photo " +
                (i + 1) +
                " exceeds the maximum file size of " +
                Constants.MAX_FILE_SIZE +
                ". Please use a smaller photo."
            );
            return;
          } else if (!this.isImage(file)) {
            alert(
              "Photo " +
                (i + 1) +
                " is not a valid image format. Please add a different photo."
            );
            return;
          } else if (i < this.state.account.photos.length) {
            photos.push([file, this.state.account.photos[i]]);
            //if there's a file but no photo to override
          } else {
            photos.push(file);
          }
        }
      }

      //validate location field
      let locTemp = event.target.location.value.split(", ");
      if (locTemp.length !== 2) {
        alert(
          "Invalid provided latitude/longditude. Make sure input is in the exact format: [Number], [Number]"
        );
        return;
      }
      let locationLat = locTemp[0].trim();
      let locationLong = locTemp[1].trim();
      if (locationLong.endsWith("z")) {
        locationLong = locationLong.substring(0, locationLong.length - 2); //-1 includes last char ('z')
      }
      if (!(this.isLatitude(locationLat) && this.isLongitude(locationLong))) {
        alert(
          "Invalid provided latitude/longditude. Make sure input is in the exact format: [Number], [Number]"
        );
        return;
      }
      //validate personal email
      let email = event.target.personalEmail.value;
      if (!Constants.emailRegex.test(String(email).toLowerCase())) {
        alert(
          "Owner email was improperly formatted. Please double check formatting."
        );
        return;
      }
      //validate both phone numbers
      if (
        this.hasNonNumbers(
          event.target.phone.value + event.target.personalPhone.value
        )
      ) {
        alert(
          "A phone number was improperly formatted. Make sure neither contains any letters"
        );
        return;
      }
      let ownerInfo = this.state.account.ownerInfo;
      ownerInfo.personalEmail = event.target.personalEmail.value;
      ownerInfo.personalPhone = event.target.personalPhone.value.replace(
        /[\s()-]+/gi,
        ""
      );
      let data = {
        phone: event.target.phone.value.replace(/[\s()-]+/gi, ""),
        businessType: this.state.account.businessType,
        ownerInfo,
        description: event.target.description.value,
        descriptionTrans: event.target.descriptionTrans.value,
        website: event.target.website.value,
        lat: locationLat,
        long: locationLong,
        hours: this.state.account.hours
      };
      this.setState({ submitted: true, creationProgress: 0 });
      setTimeout(() => {
        firebase.uploadUserPhotos(photos, error => {
          if (error) {
            this.handleSubmissionError(error);
            return;
          }
          this.setState({ creationProgress: 25 });
          firebase.getUserPhotos((urls, error) => {
            if (error) {
              this.handleSubmissionError(error);
              return;
            }
            this.setState({ creationProgress: 50 });
            firebase.updatePhotoUrls(data, urls, error => {
              if (error) {
                this.handleSubmissionError(error);
                return;
              }
              this.setState({ creationProgress: 75 });
              firebase.updateAccountInfo(data, error => {
                if (error) {
                  this.handleSubmissionError(error);
                  return;
                }
                this.setState({ creationProgress: 100 });
                setTimeout(() => {
                  alert("Account information updated successfully!");
                  this.props.history.push("/home");
                }, 500);
              });
            });
          });
        });
      }, 1000);
    }
  };

  render() {
    return (
      <div>
        <AppBar position="static" style={{ backgroundColor: Constants.BROWN }}>
          <Toolbar>
            <SettingsIcon style={{ marginRight: "8px" }} />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Settings
            </Typography>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={this.handleMenu}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={this.state ? this.state.anchor : null}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={Boolean(this.state && this.state.anchor)}
              onClose={this.handleClose}
            >
              <MenuItem onClick={this.openHome}>Home</MenuItem>
              <MenuItem onClick={this.openMyAccount}>My Account</MenuItem>
              <MenuItem disabled>Settings</MenuItem>
              <MenuItem onClick={this.openPayment}>Payment Options</MenuItem>
              <MenuItem onClick={this.openAdvertisements}>
                Premium Advertisements
              </MenuItem>
              <MenuItem onClick={this.handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        {this.state && !this.state.submitted ? (
          <Container component="main" maxWidth="sm">
            <CssBaseline />
            <Paper style={Styles.sectionPaper}>
              <Typography component="h5" variant="h5" gutterBottom>
                Edit Account
              </Typography>
              <form style={{ width: "100%" }} onSubmit={this.handleSubmit}>
                <Paper style={Styles.subPaper}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography component="h6" variant="h5">
                        Owner
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                        defaultValue={
                          this.state.account.ownerInfo.personalEmail
                        }
                        required
                        fullWidth
                        id="personalEmail"
                        label="Personal Email"
                        name="personalEmail"
                        autoComplete="personalEmail"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                        defaultValue={
                          this.state.account.ownerInfo.personalPhone
                        }
                        required
                        fullWidth
                        id="personalPhone"
                        label="Personal Phone"
                        name="personalPhone"
                        autoComplete="personalPhone"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        style={{ color: Constants.DISABLED_TEXT_COLOR }}
                      >
                        *Note that email asssociated with the account cannot
                        change. Changing the personal email only changes how
                        Kinashe associates will contact you.
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                <Paper style={Styles.subPaper}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography component="h6" variant="h5">
                        Business
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        defaultValue={this.state.account.description}
                        inputProps={{
                          maxLength: Constants.MAX_LONG_INPUT_DESC
                        }}
                        variant="outlined"
                        required
                        fullWidth
                        id="description"
                        label="Description"
                        multiline
                        rows={8}
                        name="desc"
                        autoComplete="desc"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        defaultValue={this.state.account.descriptionTrans}
                        inputProps={{
                          maxLength: Constants.MAX_LONG_INPUT_DESC
                        }}
                        variant="outlined"
                        required
                        fullWidth
                        id="descriptionTrans"
                        label="መግለጫ (Amharic)"
                        multiline
                        rows={8}
                        name="desc"
                        autoComplete="desc"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        defaultValue={this.state.account.website}
                        inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                        variant="outlined"
                        fullWidth
                        id="website"
                        label="Website"
                        name="website"
                        autoComplete="website"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        defaultValue={this.state.account.phone}
                        onChange={this.onChangePhone}
                        inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                        variant="outlined"
                        required
                        fullWidth
                        id="phone"
                        label="Phone Number"
                        name="phone"
                        autoComplete="phone"
                      />
                    </Grid>

                    {!(this.state.lat && this.state.long) ? (
                      <Grid item xs={12}>
                        <TextField
                          defaultValue={
                            this.state.account.lat +
                            ", " +
                            this.state.account.long
                          }
                          inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                          variant="outlined"
                          required
                          fullWidth
                          id="location"
                          label="Address or Latitude/Longitude"
                          name="location"
                          autoComplete="location"
                        />
                      </Grid>
                    ) : (
                      <Grid item xs={12}>
                        <TextField
                          variant="filled"
                          inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                          required
                          fullWidth
                          id="location"
                          label="Address or Latitude/Longitude"
                          name="location"
                          autoComplete="location"
                          value={this.state.lat + ", " + this.state.long}
                          InputLabelProps={{
                            shrink: true,
                            readOnly: true
                          }}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Button
                        onClick={this.findLocation}
                        style={{ marginLeft: "auto" }}
                      >
                        Find Current Location
                      </Button>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6">Photos:</Typography>
                      {[0, 1, 2, 3].map(index => (
                        <Grid
                          key={index}
                          container
                          direction={"row"}
                          alignItems={"center"}
                        >
                          <Typography>
                            Photo {index + 1}(
                            {this.state.account.photos.length > index
                              ? "change"
                              : "new"}
                            )
                          </Typography>
                          <input
                            type={"file"}
                            id={"file" + index}
                            accept={"image/*"}
                          />
                          {this.state.account.photos.length > index ? (
                            <Grid container direction={"column"}>
                              <img
                                src={this.state.account.photos[index]}
                                style={{ maxWidth: "150px" }}
                                key={0}
                                alt={"company photo " + index}
                              />
                              <div style={{ width: "40%" }}>
                                <Button
                                  fullWidth
                                  onClick={() => this.removePhoto(index)}
                                  disabled={
                                    this.state.account.photos.length === 1
                                  }
                                  variant="contained"
                                >
                                  Remove
                                </Button>
                              </div>
                            </Grid>
                          ) : null}
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Paper>
                <Paper style={Styles.subPaperTight}>
                  <Grid container spacing={5} style={{ marginTop: "4px" }}>
                    <Grid item xs={12}>
                      <Typography variant={"h5"} style={{ marginLeft: "3%" }}>
                        Operating Hours:
                      </Typography>
                      <List>
                        {Constants.days.map((day, index) => (
                          <ListItem key={day}>
                            <ListItemText primary={day} />
                            <TextField
                              key={day + "open"}
                              id={index.toString() + "open"}
                              label="Open"
                              type="time"
                              defaultValue={this.state.account.hours[index][0]}
                              onChange={this.onChangeStartHour}
                              InputLabelProps={{
                                shrink: true
                              }}
                              inputProps={{
                                step: 900 // 15 min
                              }}
                            />
                            <TextField
                              key={day + "close"}
                              id={index.toString() + "close"}
                              label="Close"
                              type="time"
                              defaultValue={this.state.account.hours[index][1]}
                              onChange={this.onChangeEndHour}
                              InputLabelProps={{
                                shrink: true
                              }}
                              inputProps={{
                                step: 900 // 15 min
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid
                      item
                      style={{
                        marginRight: "1%",
                        marginBottom: "1%",
                        marginLeft: "auto"
                      }}
                    >
                      <Button
                        variant="text"
                        color="default"
                        onClick={this.goBack}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={this.state.submitted}
                        style={Styles.buttonPrimary}
                      >
                        Save Changes
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </form>
            </Paper>
          </Container>
        ) : (
          <div>
            {this.state && this.state.submitted ? (
              <Container component="main" maxWidth="sm">
                <Paper style={Styles.subPaper}>
                  <div style={{ textAlign: "center" }}>
                    <Typography component="h1" variant="h5">
                      Please Wait...
                    </Typography>
                    <CircularProgress
                      size="50px"
                      variant="static"
                      value={this.state.creationProgress}
                    />
                  </div>
                </Paper>
              </Container>
            ) : null}
          </div>
        )}
      </div>
    );
  }
}

export default geolocated()(Settings);
