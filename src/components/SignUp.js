import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import firebase from "./FirebaseInteraction";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import logoWords from "../images/KinasheLogoWords.png";
import { geolocated } from "react-geolocated";
import * as Constants from "../Constants/constants";
import * as Styles from "../Constants/Styling";

//these constants are unique to signup.
//all different categories of businesses that user can choose from
const initialTypes = [
  "[Select a type]",
  "Air Travel (የአየር ጉዞ)",
  "Bank (ባንክ)",
  "Cafe (ካፌ)",
  "Church (ቤተክርስቲያን)",
  "Entertainment (መዝናኛ)",
  "Fitness and Health (የእስፓርት ማዕከሎች)",
  "Food (ምግብ)",
  "Hair Salon/Spa (የውበት ሳሎን እና ስፓ)",
  "Lodging (የማረፍያ ቦታ)",
  "Major Attractions (ዋና መስህብ)",
  "Medical (ሕክምና)",
  "School (ትምህርት ቤት)",
  "Shopping (ግብይት)",
  "Transportation (መጓጓዣ)",
  "Other (ቀሪ ነገሮች)"
];
const nestedTypes = {
  1: ["[Select a type]", "Airport (አየር ማረፊያ)", "Travel Agency (የጉዞ ወኪል)"],
  5: [
    "[Select a type]",
    "Bar/Club (መጠጥ ቤትና ጭፈራ ቤት)",
    "Cultural (ባህላዊ)",
    "Movie Theater (የፊልም/ቲያትር ቤት)",
    "Park/Recreation (ፓርክ/መዝናኛዎች)"
  ],

  7: [
    "[Select a type]",
    "Bakery (ዳቦ ቤት)",
    "Butcher Shop (ሥጋ ቤት)",
    "Grocery Store (ግሮሰሪ ሱቅ)",
    "Restaurant (ምግብ ቤት)"
  ],
  8: ["[Select a type]", "Barber (ፀጉር አስተካካይ)", "Salon (ሳሎን)", "Spa (ስፓ)"],
  9: ["[Select a type]", "Guest house (የእንግዳ ማረፊያ)", "Hotel (ሆቴል)"],
  10: [
    "[Select a type]",
    "Monument (ሐውልት)",
    "Museum (ሙዚየም)",
    "Sightseeing (መጎብኘት)"
  ],
  11: ["[Select a type]", "Hospital (ሆስፒታል)", "Pharmacy (መድኃኒት ቤት)"],
  13: [
    "[Select a type]",
    "Bookstore (የመጻሕፍት መደብር)",
    "Clothes (ልብስ)",
    "Cosmetics (መዋቢያዎች)",
    "Electronics (ኤሌክትሮኒክስ)",
    "Footwear (ጫማ)",
    "Hardware (ሃርድዌር)",
    "Jewelry (ጌጣጌጥ)",
    "Sporting Goods (የስፖርት ዕቃዎች)"
  ],

  14: [
    "[Select a type]",
    "Car Rental (የመኪና ኪራይ)",
    "Gas (ነዳጅ ማደያ)",
    "Taxi (ታክሲ)",
    "Train (ባቡር)"
  ]
};

/**
 * UI for creating a new account. Collects all information, validates it,
 * and passes it to firebase to set up an account
 */
class SignUp extends Component {
  constructor(props) {
    super(props);
    if (firebase.isAdmin()) {
      this.props.history.push("/adminHome");
    } else if (firebase.isAuthenticated()) {
      this.props.history.push("/home");
    }
    let hours = [];
    for (let i = 0; i < 7; i++) {
      hours.push([Constants.DEFAULT_START_HOUR, Constants.DEFAULT_END_HOUR]);
    }
    this.state = {
      initialType: "",
      initialAnchor: null,
      initialTypeIndex: 0,

      nestedAnchor: null,
      nestedTypeIndex: 0,

      nestedType: false,
      businessType: "",
      hours,

      submitted: false
    };
  }

  /**
   * bundle of methods to handle type selection from dropdown menu
   */
  handleMenuItemClick = index => {
    let nestedType = false;
    let businessType = initialTypes[index];
    if (nestedTypes[index]) {
      nestedType = true;
      businessType = nestedTypes[index][0];
    }
    this.setState({
      nestedType,
      businessType,
      nestedTypeIndex: 0,
      initialTypeIndex: index,
      initialAnchor: null,
      initialType: initialTypes[index]
    });
  };
  handleClick = event => {
    this.setState({ initialAnchor: event.currentTarget });
  };
  handleClose = () => {
    this.setState({ initialAnchor: null });
  };

  handleMenuItemClickNested = index => {
    this.setState({
      nestedTypeIndex: index,
      nestedAnchor: null,
      businessType: nestedTypes[this.state.initialTypeIndex][index]
    });
  };
  handleClickNested = event => {
    this.setState({ nestedAnchor: event.currentTarget });
  };
  handleCloseNested = () => {
    this.setState({ nestedAnchor: null });
  };

  /**
   * handles changes to start and end hour respectively
   *
   * @param {object} event the event raised when hours are changed
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
   * @param {int} day a value between 0 and 6 inclusive, representing a day of the week
   * @param {int} startEnd 0 if modifying opening time, 1 if modifying closing time
   * @param {string} time a time of hours and minutes, in military format
   */
  changeHours = (day, startEnd, time) => {
    const hours = this.state.hours;
    hours[day][startEnd] = time;
    this.setState({ hours });
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
   * handles any backend errors on account creation, deleting everything
   * created for the user thus far
   *
   * @param {object} error possible error thrown during account deletion
   */
  handleCreationError = error => {
    let page = this;
    firebase.deleteUserAccount(e => {
      page.setState({ submitted: false });
      alert("Error creating account: " + error.message + "." + e.message);
    });
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
   * handles submission of entire form, passing information collected to firebase object
   *
   * @param {event} event the event generated when form is submitted
   */
  handleSubmit = event => {
    event.preventDefault();
    if (window.confirm("Create account?")) {
      //validate company photos
      let photos = [];
      for (let i = 0; i < 4; i++) {
        let file = event.target["file" + i].files[0];
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
                " is not a valid image format. Please select a different photo."
            );
            return;
          } else photos.push(file);
        }
      }
      //validate proof of ownership
      let proof = event.target.proof.files[0];
      if (!proof || !this.isImage(proof)) {
        alert(
          "Proof of ownership is not a valid image format. Please select a different photo."
        );
      }
      if (proof.size / 1024 / 1024 > Constants.MAX_FILE_SIZE) {
        alert(
          "File provided for 'proof of ownership' exceeds maximum file size of " +
            Constants.MAX_FILE_SIZE +
            ". Please add a smaller file."
        );
        return;
      }
      //validate location field
      let locTemp = event.target.location.value.split(",");
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
      //validate that password matches repassword
      if (event.target.password.value !== event.target.repassword.value) {
        alert("Passwords do not match, try again");
        return;
      }
      //validate that a business type was selected
      let businessType = this.state.businessType
        .replace(/\//g, "-")
        .substring(0, this.state.businessType.indexOf(" ("));
      if (businessType === "[Select a type]" || businessType === "") {
        alert("Please select a business type.");
        return;
      }
      //validate personal email
      if (
        !Constants.emailRegex.test(
          event.target.personalEmail.value.toLowerCase()
        )
      ) {
        alert(
          "Owner email was improperly formatted. Please double check formatting."
        );
        return;
      }
      //validate company email
      if (!Constants.emailRegex.test(event.target.email.value.toLowerCase())) {
        alert(
          "Business email was improperly formatted. Please double check formatting."
        );
        return;
      }

      //validate owner first and last name
      if (
        this.hasNumbers(
          event.target.firstName.value + event.target.lastName.value
        )
      ) {
        alert(
          "Owner's name was imporperly formatted. Make sure it doesn't contain any numbers"
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
          "A phone number was improperly formatted. Make the value entered contains only digits 0-9"
        );
        return;
      }
      let data = {
        email: event.target.email.value.toLowerCase(),
        //replace any dashes in phone # with empty string
        phone: event.target.phone.value.replace(/[\s()-]+/gi, ""),
        companyName: event.target.companyName.value,
        description: event.target.description.value,
        descriptionTrans: event.target.descriptionTrans.value,
        website: event.target.website.value,
        lat: locationLat,
        long: locationLong,
        hours: this.state.hours,
        monthlyPayment: 0,
        accountCreatedTime: new Date().getTime(),
        businessType,
        ownerInfo: {
          firstName: event.target.firstName.value,
          lastName: event.target.lastName.value,
          personalEmail: event.target.personalEmail.value,
          personalPhone: event.target.personalPhone.value.replace(
            /[\s()-]+/gi,
            ""
          )
        },
        //change later
        verified: false,
        employee: event.target.employee.value
      };
      let password = event.target.password.value;
      this.setState({ submitted: true, creationProgress: 0, data, password });
      setTimeout(() => {
        firebase.createUserAccount(data, password, error => {
          if (error) {
            alert("error creating account: " + error.message);
            this.setState({ submitted: false });
            return;
          }
          this.setState({ creationProgress: 23 });
          firebase.createUserCollection(data, error => {
            if (error) {
              this.handleCreationError(error);
              return;
            }
            this.setState({ creationProgress: 46 });
            firebase.uploadOwnershipProof(proof, error => {
              if (error) {
                this.handleCreationError(error);
                return;
              }
              this.setState({ creationProgress: 69 });
              firebase.uploadUserPhotos(photos, error => {
                if (error) {
                  this.handleCreationError(error);
                  return;
                }
                this.setState({ creationProgress: 95 });
                firebase.getUserPhotos((urls, error) => {
                  if (error) {
                    this.handleCreationError(error);
                    return;
                  }
                  this.setState({ creationProgress: 100 });
                  firebase.updatePhotoUrls(data, urls, error => {
                    if (error) {
                      this.handleCreationError(error);
                      return;
                    }
                    setTimeout(() => {
                      alert(
                        "Your Kinashe account has been created successfully! While you wait for your " +
                          "account to be verified, you can start still adding coupons but they will not show up" +
                          " in the app yet."
                      );
                      this.props.history.push("/home");
                    }, 500);
                  });
                });
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
        <Container component="main" maxWidth="sm">
          <CssBaseline />
          <div style={{ width: "100%", textAlign: "center" }}>
            <img
              style={Styles.logoMedium}
              src={logoWords}
              alt={"Kinashe Logo"}
            />
          </div>
          <Paper style={Styles.sectionPaper}>
            {!this.state.submitted ? (
              <div>
                <Typography
                  component="h1"
                  variant="h5"
                  gutterBottom
                  style={{ marginTop: "1%", marginBottom: "3%" }}
                >
                  Create new Account:
                </Typography>
                <form style={{ width: "100%" }} onSubmit={this.handleSubmit}>
                  <Grid container direction="column" spacing={2}>
                    {/* owner section */}
                    <Paper style={Styles.subPaper}>
                      <Grid container spacing={2} direction="column">
                        <Grid item xs={12}>
                          <Typography component="h6" variant="h5">
                            Owner
                          </Typography>
                        </Grid>
                        <Grid item container direction="row" spacing={1}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              variant="outlined"
                              required
                              inputProps={{
                                maxLength: Constants.MAX_SHORT_INPUT
                              }}
                              defaultValue={
                                this.state.data
                                  ? this.state.data.ownerInfo.firstName
                                  : ""
                              }
                              fullWidth
                              id="firstName"
                              label="First Name"
                              autoComplete="fname"
                              name="firstName"
                              autoFocus
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              variant="outlined"
                              required
                              inputProps={{
                                maxLength: Constants.MAX_SHORT_INPUT
                              }}
                              defaultValue={
                                this.state.data
                                  ? this.state.data.ownerInfo.lastName
                                  : ""
                              }
                              fullWidth
                              id="lastName"
                              label="Last Name"
                              name="lastName"
                              autoComplete="lname"
                            />
                          </Grid>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data
                                ? this.state.data.ownerInfo.personalEmail
                                : ""
                            }
                            required
                            fullWidth
                            id="personalEmail"
                            label="Personal Email"
                            name="personalEmail"
                            autoComplete="email"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data
                                ? this.state.data.ownerInfo.personalPhone
                                : ""
                            }
                            required
                            fullWidth
                            id="personalPhone"
                            label="Personal Phone"
                            name="personalPhone"
                            autoComplete="phone"
                          />
                        </Grid>
                      </Grid>
                    </Paper>

                    <Paper style={Styles.subPaper}>
                      <Grid container direction="column" spacing={2}>
                        <Grid item xs={12}>
                          <Typography component="h6" variant="h5">
                            Business
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data ? this.state.data.companyName : ""
                            }
                            required
                            fullWidth
                            id="companyName"
                            label="Name"
                            name="business"
                            autoComplete="business"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            required
                            inputProps={{
                              maxLength: Constants.MAX_LONG_INPUT_DESC
                            }}
                            defaultValue={
                              this.state.data ? this.state.data.description : ""
                            }
                            multiline
                            rows={8}
                            fullWidth
                            id="description"
                            label="Description"
                            name="desc"
                            autoComplete="desc"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            required
                            inputProps={{
                              maxLength: Constants.MAX_LONG_INPUT_DESC
                            }}
                            defaultValue={
                              this.state.data
                                ? this.state.data.descriptionTrans
                                : ""
                            }
                            multiline
                            rows={8}
                            fullWidth
                            id="descriptionTrans"
                            label="መግለጫ (Amharic)"
                            name="desc"
                            autoComplete="desc"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data ? this.state.data.website : ""
                            }
                            fullWidth
                            id="website"
                            label="Website"
                            name="website"
                            autoComplete="website"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data ? this.state.data.phone : ""
                            }
                            fullWidth
                            id="phone"
                            label="Phone Number"
                            name="phone"
                            autoComplete="phone"
                          />
                        </Grid>
                        {this.state.lat && this.state.long ? (
                          <Grid item xs={12}>
                            <TextField
                              variant="filled"
                              inputProps={{
                                maxLength: Constants.MAX_SHORT_INPUT
                              }}
                              required
                              fullWidth
                              id="location"
                              label="Latitude/Longitude"
                              name="location"
                              autoComplete="location"
                              value={this.state.lat + ", " + this.state.long}
                              InputLabelProps={{
                                shrink: true,
                                readOnly: true
                              }}
                            />
                          </Grid>
                        ) : (
                          <Grid item xs={12}>
                            <TextField
                              variant="outlined"
                              inputProps={{
                                maxLength: Constants.MAX_SHORT_INPUT
                              }}
                              required
                              fullWidth
                              id="location"
                              label="Latitude/Longitude"
                              defaultValue={
                                this.state.data
                                  ? this.state.data.lat +
                                    ", " +
                                    this.state.data.long
                                  : ""
                              }
                              name="location"
                              autoComplete="location"
                            />
                          </Grid>
                        )}
                        <Grid
                          item
                          container
                          direction="row"
                          flex="start"
                          xs={12}
                        >
                          <Grid item>
                            <Button
                              onClick={this.findLocation}
                              style={{ marginLeft: "auto" }}
                            >
                              Use Current Location
                            </Button>
                          </Grid>
                          <Grid item>
                            <Typography
                              style={{ marginTop: "9px", fontSize: "13px" }}
                            >
                              OR{" "}
                              <a href="https://www.google.com/maps">
                                FIND LOCATION
                              </a>
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* possible fix: put business type dropdowns in this grid */}
                        <Grid item container direction="column">
                          <Grid
                            item
                            container
                            direction={"row"}
                            alignItems={"center"}
                            xs={12}
                          >
                            <Grid item>
                              <Typography>Business Type*:</Typography>
                            </Grid>
                            <Grid item>
                              {" "}
                              <List
                                component="nav"
                                aria-label="Device settings"
                              >
                                <ListItem
                                  button
                                  aria-haspopup="true"
                                  aria-controls="lock-menu"
                                  aria-label="when device is locked"
                                  onClick={this.handleClick}
                                >
                                  <ListItemText
                                    primary={
                                      initialTypes[this.state.initialTypeIndex]
                                    }
                                  />
                                </ListItem>
                              </List>
                              <Menu
                                id="simple-menu"
                                anchorEl={this.state.initialAnchor}
                                keepMounted
                                open={Boolean(this.state.initialAnchor)}
                                onClose={this.handleClose}
                              >
                                {initialTypes.map((option, index) => (
                                  <MenuItem
                                    key={option}
                                    selected={
                                      index === this.state.initialTypeIndex
                                    }
                                    onClick={() =>
                                      this.handleMenuItemClick(index)
                                    }
                                  >
                                    {option}
                                  </MenuItem>
                                ))}
                              </Menu>
                            </Grid>
                          </Grid>

                          {this.state.nestedType ? (
                            <Grid
                              item
                              container
                              direction={"row"}
                              alignItems={"center"}
                              xs={12}
                            >
                              <Grid item>
                                <Typography>Please Specify*:</Typography>
                              </Grid>
                              <Grid item>
                                <List
                                  component="nav"
                                  aria-label="Device settings"
                                >
                                  <ListItem
                                    button
                                    aria-haspopup="true"
                                    aria-controls="lock-menu"
                                    aria-label="when device is locked"
                                    onClick={this.handleClickNested}
                                  >
                                    <ListItemText
                                      primary={
                                        nestedTypes[
                                          this.state.initialTypeIndex
                                        ][this.state.nestedTypeIndex]
                                      }
                                    />
                                  </ListItem>
                                </List>
                                <Menu
                                  id="simple-menu"
                                  anchorEl={this.state.nestedAnchor}
                                  keepMounted
                                  open={Boolean(this.state.nestedAnchor)}
                                  onClose={this.handleCloseNested}
                                >
                                  {nestedTypes[this.state.initialTypeIndex].map(
                                    (option, index) => (
                                      <MenuItem
                                        key={option}
                                        selected={
                                          index === this.state.nestedTypeIndex
                                        }
                                        onClick={() =>
                                          this.handleMenuItemClickNested(index)
                                        }
                                      >
                                        {option}
                                      </MenuItem>
                                    )
                                  )}
                                </Menu>
                              </Grid>
                            </Grid>
                          ) : null}
                        </Grid>

                        <Grid item xs={12}>
                          <Typography>Hours:</Typography>
                        </Grid>
                        <Grid
                          item
                          container
                          direction="column"
                          xs={12}
                          spacing={2}
                          style={{ marginLeft: "10px" }}
                        >
                          {this.state.hours.map((hours, index) => (
                            <Grid
                              item
                              container
                              direction="row"
                              justify="space-between"
                              key={index.toString()}
                            >
                              <Grid item>
                                {" "}
                                <Typography>{Constants.days[index]}</Typography>
                              </Grid>
                              <Grid item>
                                <TextField
                                  id={index.toString() + "open"}
                                  label="Open"
                                  type="time"
                                  defaultValue={
                                    this.state.data
                                      ? this.state.hours[index][0]
                                      : Constants.DEFAULT_START_HOUR
                                  }
                                  onChange={this.onChangeStartHour}
                                  InputLabelProps={{
                                    shrink: true
                                  }}
                                  inputProps={{
                                    step: 60
                                  }}
                                />
                                <TextField
                                  id={index.toString() + "close"}
                                  label="Close"
                                  type="time"
                                  defaultValue={
                                    this.state.data
                                      ? this.state.hours[index][1]
                                      : Constants.DEFAULT_END_HOUR
                                  }
                                  onChange={this.onChangeEndHour}
                                  InputLabelProps={{
                                    shrink: true
                                  }}
                                  inputProps={{
                                    step: 900 // 15 min
                                  }}
                                />
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>

                        <Grid item xs={12}>
                          <Typography>Documents:</Typography>
                        </Grid>
                        <Grid
                          item
                          container
                          direction={"column"}
                          spacing={2}
                          style={{ marginLeft: "10px" }}
                        >
                          <Grid
                            item
                            container
                            direction="row"
                            justify="space-between"
                          >
                            <Grid item>
                              <Typography>Proof of ownership*:</Typography>
                            </Grid>
                            <Grid item>
                              <input
                                type={"file"}
                                id={"proof"}
                                accept={"image/*"}
                                required
                              />
                            </Grid>
                          </Grid>
                          {[0, 1, 2, 3].map((ref, index) => (
                            <Grid
                              item
                              container
                              direction="row"
                              justify="space-between"
                              key={index.toString()}
                            >
                              <Grid item>
                                <Typography>
                                  Business photo {index + 1}
                                  {index === 0 ? "*" : " (optional)"}:
                                </Typography>
                              </Grid>
                              <Grid item>
                                <input
                                  type={"file"}
                                  id={"file" + index}
                                  accept={"image/*"}
                                  required={index === 0}
                                />
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                        <Grid item xs={12} style={{ marginTop: "10px" }}>
                          <Typography>
                            If a Kinashe employee helped you sign up, please
                            enter their name below
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data ? this.state.data.employee : ""
                            }
                            fullWidth
                            id="employee"
                            label="Employee Name"
                            name="employee"
                            autoComplete="employee"
                          />
                        </Grid>
                      </Grid>
                    </Paper>

                    <Paper style={Styles.subPaper}>
                      <Grid container direction="column" spacing={2}>
                        <Grid item xs={12}>
                          <Typography component="h6" variant="h5">
                            Account
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data ? this.state.data.email : ""
                            }
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data ? this.state.password : ""
                            }
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            variant="outlined"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            defaultValue={
                              this.state.data ? this.state.password : ""
                            }
                            required
                            fullWidth
                            type="password"
                            id="repassword"
                            label="Re-enter Password"
                            autoComplete="current-password"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                required
                                id="control"
                                value="acknowledge"
                                color="primary"
                                style={{ color: Constants.BLUE }}
                              />
                            }
                            label="I acknowledge that all the information I have entered is correct and true."
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    style={Styles.buttonPrimary}
                    disabled={this.state.submitted}
                  >
                    Sign Up
                  </Button>
                  <Grid container justify="flex-end">
                    <Grid item>
                      <Link href="/" variant="body2">
                        Already have an account? Sign in
                      </Link>
                    </Grid>
                  </Grid>
                </form>
              </div>
            ) : (
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
            )}
          </Paper>
        </Container>
      </div>
    );
  }
}

export default geolocated()(SignUp);
