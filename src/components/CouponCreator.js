import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import firebase from "./FirebaseInteraction";
import Checkbox from "@material-ui/core/Checkbox";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CreateIcon from "@material-ui/icons/Create";
import Zemen from "zemen";
import "date-fns";
import * as Constants from "../Constants/constants";
import * as Styles from "../Constants/Styling";

const date = {
  width: "12%",
  justifyContent: "flex-end"
};
const largeTextField = {
  marginBottom: "2%",
  marginTop: "2%"
};

/**
 * the UI for creating a new coupon
 */
class CouponCreator extends Component {
  /**
   * takes user back to home page
   */
  goBack = () => {
    this.props.history.push("/home");
  };

  /**
   * submits the coupon to database, validating some of its information first
   */
  handleSubmit = event => {
    event.preventDefault();
    if (window.confirm("Submit new coupon?")) {
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
        firebase.getUserAccountDetails((details, error) => {
          if (error) {
            alert("error submitting coupon: " + error.message);
          } else {
            firebase.createNewCoupon(details, coupon, error => {
              if (error) {
                alert("error submitting coupon: " + error.message);
              } else {
                alert("coupon created successfully!");
                this.props.history.push("/home");
              }
            });
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
            <CreateIcon style={{ marginRight: "8px" }} />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Coupon Creator
            </Typography>
            <Button
              onClick={this.goBack}
              variant="contained"
              style={Styles.buttonPrimary}
            >
              Back
            </Button>
          </Toolbar>
        </AppBar>

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
                      fullWidth
                      id="availabilityTrans"
                      label="የቅናሽ ኩፖኑን መጠቀምያ ሰዕትና ቀኖች (Amharic)"
                    />
                  </Grid>
                  <Typography style={{ marginTop: "30px" }}>
                    {" "}
                    Please enter a valid date from the Ethiopian calendar. Your
                    coupon will automatically become inactive on this day, but
                    you can still reuse it by changing its expiration
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
                      <Typography> Expiration (የመጠቀሚያ ግዜ):</Typography>
                    </Grid>

                    <TextField
                      style={date}
                      autoComplete="YYYY"
                      inputProps={{ maxLength: 4 }}
                      size={"small"}
                      id="year"
                      label="YYYY"
                    />
                    <TextField
                      style={date}
                      autoComplete="MM"
                      inputProps={{ maxLength: 2 }}
                      size={"small"}
                      id="month"
                      label="MM"
                    />
                    <TextField
                      style={date}
                      autoComplete="DD"
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
                      defaultChecked={true}
                      id="active"
                      color="primary"
                      style={{ color: Constants.BLUE }}
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                  </Grid>
                  <Grid item>
                    <Typography component="h1">Set coupon as active</Typography>
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
                  <Button variant="text" color="default" onClick={this.goBack}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    style={Styles.buttonPrimary}
                  >
                    Submit Coupon
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </div>
    );
  }
}

export default CouponCreator;
