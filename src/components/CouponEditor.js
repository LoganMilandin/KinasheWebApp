import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import firebase from "./FirebaseInteraction";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import "date-fns";
import Zemen from "zemen";
import Checkbox from "@material-ui/core/Checkbox";
import EditIcon from "@material-ui/icons/Edit";
import * as Constants from "../Constants/constants";
import * as Styles from "../Constants/Styling";

const date = {
  width: "15%",
  justifyContent: "flex-end"
};
const largeTextField = {
  marginBottom: "2%",
  marginTop: "2%"
};

/**
 * UI for editing an existing coupon
 */
class CouponEditor extends Component {
  constructor(props) {
    super(props);
    if (sessionStorage.getItem("couponIndex")) {
      this.index = JSON.parse(sessionStorage.getItem("couponIndex"));
      firebase.getUserAccountDetails((account, error) => {
        if (error) {
          alert("error getting coupon information: " + error.message);
        } else {
          this.details = account;
          let coupon = account.coupons[this.index];
          this.setState(coupon);
        }
      });
    } else {
      alert("There was a problem editing this coupon");
      this.props.history.push("/home");
    }
  }

  /**
   * takes user back to home page
   */
  goBack = () => {
    this.props.history.push("/home");
  };

  /**
   * bundle of methods to get month year and day from expiration
   * string. Used for default value on those text fields
   */
  getYear = dateString => {
    return dateString.substring(0, dateString.indexOf("-"));
  };
  getMonth = dateString => {
    return dateString.substring(
      dateString.indexOf("-") + 1,
      dateString.lastIndexOf("-")
    );
  };
  getDay = dateString => {
    return dateString.substring(dateString.lastIndexOf("-") + 1);
  };

  /**
   * submits changes to coupon to database. Works much the same as submitting
   * a new coupon
   */
  handleSubmit = event => {
    event.preventDefault();
    if (window.confirm("Save changes?")) {
      let expiration =
        event.target.year.value +
        "-" +
        event.target.month.value +
        "-" +
        event.target.day.value;
      let validDate = true;
      let expDate;
      try {
        expDate = Zemen.toGC(expiration);
      } catch (e) {
        validDate = false;
      }
      if (!validDate) {
        alert(
          "Please enter a valid date from the Ethiopian calendar. The format must be " +
            "YYYY/MM/DD"
        );
      } else if (Date.now() > expDate.getTime()) {
        alert(
          "Please select a valid expiration date. A coupon's expiration date can't have" +
            " passed already"
        );
      } else {
        let expTimestamp = expDate.getTime();
        let coupon = {
          title: event.target.title.value,
          titleTrans: event.target.titleTrans.value,
          deal: event.target.deal.value,
          dealTrans: event.target.dealTrans.value,
          availability: event.target.availability.value,
          availabilityTrans: event.target.availabilityTrans.value,
          expiration,
          expTimestamp,
          active: event.target.active.checked
        };

        firebase.editCoupon(this.details, coupon, this.index, error => {
          if (error) {
            alert("error modifying coupon: " + error.message);
          } else {
            alert("coupon modified successfully!");
            this.props.history.push("/home");
          }
        });
      }
    }
  };

  render() {
    return (
      <div>
        <AppBar position="static" style={{ backgroundColor: Constants.BROWN }}>
          <Toolbar>
            <EditIcon style={{ marginRight: "8px" }} />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Coupon Editor
            </Typography>
          </Toolbar>
        </AppBar>
        {this.state ? (
          <Container component="main" maxWidth="sm">
            <Paper style={Styles.sectionPaper}>
              <form style={{ width: "100%" }} onSubmit={this.handleSubmit}>
                <Grid
                  container
                  justify="space-between"
                  direction="row"
                  alignItems={"center"}
                >
                  <Grid item>
                    <Typography variant="h5">Coupon Information</Typography>
                  </Grid>
                  <Grid item>
                    <a href="https://translate.google.com/" target={"_blank"}>
                      Translate
                    </a>
                  </Grid>
                </Grid>

                <Grid container spacing={2} alignItems={"flex-end"}>
                  <Paper style={Styles.subPaper}>
                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                        required
                        id="title"
                        label="Coupon Name (English)"
                        defaultValue={this.state.title}
                        autoComplete="name"
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                        required
                        id="titleTrans"
                        label="የቅናሽ ኩፖኑ ስም (Amharic)"
                        defaultValue={this.state.titleTrans}
                        autoComplete="nameAmharic"
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        required
                        inputProps={{ maxLength: Constants.MAX_LONG_INPUT }}
                        id="deal"
                        label="Coupon Description (English)"
                        defaultValue={this.state.deal}
                        style={largeTextField}
                        fullWidth
                        autoComplete="description"
                        variant={"outlined"}
                        multiline
                        rows={6}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        id="dealTrans"
                        inputProps={{ maxLength: Constants.MAX_LONG_INPUT }}
                        required
                        defaultValue={this.state.dealTrans}
                        label="የቅናሽ ኩፖኑ ዝርዝር መግለጫ (Amharic)"
                        style={largeTextField}
                        fullWidth
                        autoComplete="descriptionTrans"
                        variant={"outlined"}
                        multiline
                        rows={6}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        autoComplete="availability"
                        inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                        required
                        defaultValue={this.state.availability}
                        fullWidth
                        id="availability"
                        label="Availability [e.g. Monday-Friday] (English)"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        autoComplete="availability"
                        inputProps={{ maxLength: Constants.MAX_SHORT_INPUT }}
                        required
                        defaultValue={this.state.availabilityTrans}
                        fullWidth
                        id="availabilityTrans"
                        label="የቅናሽ ኩፖኑን መጠቀምያ ሰዕትና ቀኖች (Amharic)"
                      />
                    </Grid>

                    <Typography style={{ marginTop: "30px" }}>
                      {" "}
                      Please enter a valid date from the Ethiopian calendar.
                      Your coupon will automatically become inactive on this
                      day, but you can still reuse it by changing its expiration
                    </Typography>

                    <Typography>
                      {" "}
                      እዚህ ጋር ኩፖኑ ጊዜው የሚያልፍብትን ትክክለኛ ቅን በኢትዮጵያውያን አቆጣጠር ይፃፉ:: እርሶ
                      ቀኑን ማራዘም ካልፈለጉ በቅር በተገለጸው ቀን ኩፖኑ ቀን እንዲያልፍበት ይደረጋል::
                    </Typography>

                    <Grid
                      item
                      container
                      justify="flex-start"
                      direction="row"
                      alignItems={"flex-end"}
                    >
                      <Grid item>
                        <Typography> Expiration (የመጠቀሚያ ግዜ)</Typography>
                      </Grid>

                      <TextField
                        style={date}
                        autoComplete="YYYY"
                        defaultValue={this.getYear(this.state.expiration)}
                        inputProps={{ maxLength: 4 }}
                        size={"small"}
                        id="year"
                        label="YYYY"
                      />
                      <TextField
                        style={date}
                        autoComplete="MM"
                        defaultValue={this.getMonth(this.state.expiration)}
                        inputProps={{ maxLength: 2 }}
                        size={"small"}
                        id="month"
                        label="MM"
                      />
                      <TextField
                        style={date}
                        autoComplete="DD"
                        defaultValue={this.getDay(this.state.expiration)}
                        inputProps={{ maxLength: 2 }}
                        size={"small"}
                        id="day"
                        label="DD"
                      />
                    </Grid>
                  </Paper>

                  <Grid
                    container
                    justify="flex-end"
                    direction="row"
                    alignItems={"center"}
                  >
                    <Grid item>
                      <Checkbox
                        defaultChecked={this.state.active}
                        id="active"
                        color="primary"
                        style={{ color: Constants.BLUE }}
                        inputProps={{ "aria-label": "primary checkbox" }}
                      />
                    </Grid>
                    <Grid item>
                      <Typography component="h1">
                        Set coupon as active
                      </Typography>
                    </Grid>
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
                      style={Styles.buttonPrimary}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        ) : null}
      </div>
    );
  }
}

export default CouponEditor;
