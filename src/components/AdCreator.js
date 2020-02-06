import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import AppBar from "@material-ui/core/AppBar";
import { Toolbar } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import CreateIcon from "@material-ui/icons/Create";
import firebase from "./FirebaseInteraction";
import Zemen from "zemen";
import Checkbox from "@material-ui/core/Checkbox";
import * as Constants from "../Constants/constants";
import * as Styles from "../Constants/Styling";

const subPaper = {
  padding: "4%",
  marginTop: "2%",
  marginBottom: "2%",
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  backgroundColor: Constants.LIGHT_GRAY,
  height: "90%" //unique prop of paper on this page
};

const button = {
  backgroundColor: Constants.BLUE,
  color: "White",

  //unique props of button on this page
  marginLeft: "auto",
  marginTop: "4%",
  width: "30%"
};

const date = {
  width: "12%",
  justifyContent: "flex-end"
};

class AdCreator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payElectronically: true,
      submitted: false
    };
  }

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

  handleCheckboxChange = (event, isElectronic) => {
    if (isElectronic) {
      this.setState({ payElectronically: event.target.checked });
    } else {
      this.setState({ payElectronically: !event.target.checked });
    }
  };

  goBack = () => {
    this.props.history.push("/advertisements");
  };

  handleSubmit = event => {
    event.preventDefault();
    if (window.confirm("Submit new advertisement?")) {
      let start =
        event.target.year.value +
        "-" +
        event.target.month.value +
        "-" +
        event.target.day.value;
      let validDate = true;
      let startDate;
      try {
        startDate = Zemen.toGC(start);
      } catch (e) {
        validDate = false;
      }
      if (!validDate) {
        alert(
          "Please enter a valid date from the Ethiopian calendar. The format must be " +
            "YYYY/MM/DD"
        );
        return;
      } else if (Date.now() > startDate.getTime()) {
        alert(
          "Please select a valid expiration date. An advertisement's start date can't have" +
            " passed already"
        );
        return;
      }
      let image = event.target.image.files[0];
      if (!image || !this.isImage(image)) {
        alert(
          "Advertisement image is not a valid image format. Please select a different photo."
        );
      }
      if (image.size / 1024 / 1024 > Constants.MAX_FILE_SIZE) {
        alert(
          "File provided for 'proof of ownership' exceeds maximum file size of " +
            Constants.MAX_FILE_SIZE +
            ". Please add a smaller file."
        );
        return;
      } else {
        this.setState({ submitted: true });
        let data = {
          title: event.target.title.value,
          message: event.target.message.value,
          start: startDate.getTime(),
          accountName: event.target.accountName.value,
          accountNumber: event.target.accountNumber
            ? event.target.accountNumber.value
            : "",
          payElectronically: this.state.payElectronically,
          active: false
        };
        console.log(data);
        firebase.submitAdRequest(data, image, error => {
          if (error) {
            alert(error.message);
          } else {
            alert("Advertisement submitted successfully!");
            this.props.history.push("/advertisements");
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
              Advertisement Creator
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
        <Container maxWidth={"md"}>
          <form onSubmit={this.handleSubmit}>
            <Paper style={Styles.sectionPaperTight}>
              <Paper style={Styles.subPaperTight}>
                <Typography variant="h5">New Advertisement</Typography>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper style={subPaper}>
                    <div style={{ width: "100%" }}>
                      <Grid container direction={"column"} spacing={1}>
                        <Grid item>
                          <Typography variant="h6">Details:</Typography>

                          <TextField
                            required
                            id="title"
                            inputProps={{
                              maxLength: Constants.MAX_SHORT_INPUT
                            }}
                            label="Title"
                            style={{ flexWrap: "wrap" }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            variant="outlined"
                            required
                            inputProps={{
                              maxLength: Constants.MAX_LONG_INPUT_DESC
                            }}
                            multiline
                            rows={8}
                            fullWidth
                            id="message"
                            label="Description/Message"
                            style={{ flexWrap: "wrap" }}
                            name="desc"
                            autoComplete="desc"
                          />
                        </Grid>
                        <Grid style={{ marginBottom: "0" }}>
                          <Typography>
                            Each premium advertisement costs 12,800 birr. The
                            date you enter below is when your advertisement will
                            become active and your push notification will be
                            sent to the app
                          </Typography>
                        </Grid>

                        <Grid
                          style={{ marginTop: "0" }}
                          item
                          container
                          justify="flex-start"
                          direction="row"
                          alignItems={"flex-end"}
                        >
                          <Typography> Start Date:</Typography>

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
                        <Grid
                          item
                          container
                          justify="flex-start"
                          direction="row"
                          alignItems={"flex-end"}
                        >
                          <Typography> Image:</Typography>
                          <input
                            type={"file"}
                            id="image"
                            accept={"image/*"}
                            required
                          />
                        </Grid>
                      </Grid>
                    </div>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper style={subPaper}>
                    <Grid item>
                      <Typography variant="h6">Payment Info:</Typography>
                    </Grid>
                    {this.state.payElectronically ? (
                      <Grid item>
                        <Typography>
                          Each premium advertisement costs 12,800 birr. Your
                          account will not be charged; this is used only for
                          verification. After you submit a request for an
                          advertisement, you must complete the payment within 48
                          hours. Once payment is received, a push notification
                          for your advertisement will be sent to the app within
                          24 hours. Additionally, for the next 7 days a pop-up
                          will appear in the app with the photo you submit and
                          the details of your advertisement
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item>
                        <Typography>
                          Each premium advertisement costs 12,800 birr. For cash
                          transactions, a Kinashe employee will come collect
                          payment for an additional fee of 100 birr. Once the
                          payment is collected, a push notification for your
                          advertisement will be sent to the app within 24 hours.
                          Additionally, for the next 7 days a pop-up will appear
                          in the app with the photo you submit and the details
                          of your advertisement
                        </Typography>
                      </Grid>
                    )}

                    <Grid item>
                      <TextField
                        required
                        id="accountName"
                        inputProps={{
                          maxLength: Constants.MAX_SHORT_INPUT
                        }}
                        label={
                          this.state.payElectronically
                            ? "Name of Account Holder"
                            : "Name of Person Paying"
                        }
                        fullWidth
                      />
                    </Grid>

                    {this.state.payElectronically ? (
                      <Grid item>
                        <TextField
                          required
                          id="accountNumber"
                          inputProps={{
                            maxLength: Constants.MAX_SHORT_INPUT
                          }}
                          label="Account Number"
                          fullWidth
                        />
                      </Grid>
                    ) : (
                      <div></div>
                    )}
                    <Grid
                      container
                      justify="flex-start"
                      direction="row"
                      alignItems={"center"}
                    >
                      <Grid item>
                        <Checkbox
                          id="electronic"
                          color="primary"
                          checked={this.state.payElectronically}
                          onChange={event =>
                            this.handleCheckboxChange(event, true)
                          }
                          style={{ color: Constants.BLUE }}
                          inputProps={{ "aria-label": "primary checkbox" }}
                        />
                      </Grid>
                      <Grid item>
                        <Typography component="h1">
                          Pay Bank/Electronically
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      justify="flex-start"
                      direction="row"
                      alignItems={"center"}
                    >
                      <Grid item>
                        <Checkbox
                          id="cash"
                          color="primary"
                          checked={!this.state.payElectronically}
                          onChange={event =>
                            this.handleCheckboxChange(event, false)
                          }
                          style={{ color: Constants.BLUE }}
                          inputProps={{ "aria-label": "primary checkbox" }}
                        />
                      </Grid>
                      <Grid item>
                        <Typography component="h1">Pay Cash</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
              <Grid item container>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  style={button}
                  disabled={this.state.submitted}
                >
                  Submit Payment
                </Button>
              </Grid>
            </Paper>
          </form>
        </Container>
      </div>
    );
  }
}

export default AdCreator;
