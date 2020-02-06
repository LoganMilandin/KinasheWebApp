import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import { Toolbar } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import CurrencyInput from "react-currency-input";
import Button from "@material-ui/core/Button";
import firebase from "./FirebaseInteraction";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
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

/**
 * UI for submitting payment requests. Handles both new plans and additional payments,
 * handles both cash and bank transaction requests
 */
class PaymentDetails extends Component {
  constructor(props) {
    super(props);
    firebase.getUserAccountDetails((details, error) => {
      if (error) {
        alert("error getting payment details");
      } else {
        if (details.paymentExpiration) {
          let expDate = new Date(details.paymentExpiration);
          details.translatedExpiration = Zemen.toEC(expDate).toString();
        }
        this.setState({
          details,
          anchor: null,
          planIndex: 0,
          menuAnchor: null,
          payElectronically: true
        });
      }
    });
  }

  /**
   * bundle of methods for plan index dropdown
   */
  handleClick = event => {
    this.setState({ anchor: event.currentTarget });
  };
  handleClosePlan = () => {
    this.setState({ anchor: null });
  };
  handlePlanItemClick = (event, index) => {
    this.setState({ planIndex: index });
    this.setState({ anchor: null });
  };

  //bundle of methods for the appbar navigation.
  handleMenu = event => {
    this.setState({ menuAnchor: event.currentTarget });
  };
  handleCloseMenu = () => {
    this.setState({ menuAnchor: null });
  };
  openHome = () => {
    this.props.history.push("/home");
  };
  openMyAccount = () => {
    this.props.history.push("/account");
  };
  openSettings = () => {
    this.props.history.push("/settings");
  };
  openAdvertisements = () => {
    this.props.history.push("/advertisements");
  };

  /**
   * handles switching between cash and electronic payment
   *
   * @param {event} event event raised when either cash or electronic checkbox
   * is clicked
   */
  handleCheckboxChange = (event, isElectronic) => {
    if (isElectronic) {
      this.setState({ payElectronically: event.target.checked });
    } else {
      this.setState({ payElectronically: !event.target.checked });
    }
  };
  /**
   * logs the user out
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

  /**
   * submits the payment request
   *
   * @param {event} event event raised when form is submitted
   */
  handleSubmit = event => {
    event.preventDefault();
    if (window.confirm("Submit payment plan?")) {
      if (this.state.details.paymentExpiration) {
        this.submitAdditionalPayment(event);
      } else {
        this.submitNewPayment(event);
      }
    }
  };

  /**
   * submits an additional payment request
   */
  submitAdditionalPayment = event => {
    let requestTime = new Date();
    let payment = {
      company: this.state.details.companyName,
      phone: this.state.details.phone,
      email: this.state.details.email,
      businessType: this.state.details.businessType,
      currentPayment: this.state.details.monthlyPayment,
      amount: event.target.amount.value,
      accountName: event.target.accountName.value,
      accountNumber: this.state.payElectronically
        ? event.target.accountNumber.value
        : "",
      requestTime: requestTime.toString(),
      expiration: this.state.details.paymentExpiration,
      electronic: this.state.payElectronically
    };
    firebase.submitPaymentRequest(false, payment, error => {
      if (error) {
        alert("error submitting payment: " + error.message);
      } else {
        alert(
          "Payment request submitted! When your payment is received, your plan will be updated."
        );
        this.props.history.push("/home");
      }
    });
  };

  /**
   * submits a plan for a new payment request
   */
  submitNewPayment = event => {
    let birr = parseFloat(
      event.target.amount.value
        .replace(/,/g, "")
        .substring(0, event.target.amount.value.indexOf(" "))
    );
    if (birr < Constants.minPayments[this.state.planIndex]) {
      alert(
        "you must pay at least " +
          Constants.minPayments[this.state.planIndex] +
          " birr for the payment period you selected"
      );
    } else {
      let requestTime = new Date();
      let payment = {
        period: Constants.plans[this.state.planIndex],
        phone: this.state.details.phone,
        email: this.state.details.email,
        company: this.state.details.companyName,
        businessType: this.state.details.businessType,
        amount: event.target.amount.value,
        accountName: event.target.accountName.value,
        accountNumber: this.state.payElectronically
          ? event.target.accountNumber.value
          : "",
        requestTime: requestTime.toString(),
        electronic: this.state.payElectronically
      };
      firebase.submitPaymentRequest(true, payment, error => {
        if (error) {
          alert("error submitting payment plan: " + error.message);
        } else {
          alert(
            "Payment request submitted! When your payment is received, your plan will be updated."
          );
          this.props.history.push("/home");
        }
      });
    }
  };

  render() {
    return (
      <div>
        <AppBar position="static" style={{ backgroundColor: Constants.BROWN }}>
          <Toolbar>
            <AccountBalanceIcon style={{ marginRight: "8px" }} />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Payment
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
              anchorEl={this.state ? this.state.menuAnchor : null}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={Boolean(this.state && this.state.menuAnchor)}
              onClose={this.handleCloseMenu}
            >
              <MenuItem onClick={this.openHome}>Home</MenuItem>
              <MenuItem onClick={this.openMyAccount}>My Account</MenuItem>
              <MenuItem onClick={this.openSettings}>Settings</MenuItem>
              <MenuItem disabled>Payment Options</MenuItem>
              <MenuItem onClick={this.openAdvertisements}>
                Premium Advertisements
              </MenuItem>
              <MenuItem onClick={this.handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        {this.state ? (
          <Container maxWidth={"md"}>
            <form onSubmit={this.handleSubmit}>
              <Paper style={Styles.sectionPaperTight}>
                <Paper style={Styles.subPaperTight}>
                  <Typography variant="h5">
                    Current Plan:{" "}
                    {this.state.details.paymentExpiration
                      ? "expires " +
                        this.state.details.translatedExpiration +
                        " (" +
                        this.state.details.monthlyPayment +
                        " birr/month)"
                      : "none"}
                  </Typography>
                </Paper>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} fullWidth>
                    <Paper style={subPaper}>
                      <Grid item>
                        {this.state.details.paymentExpiration ? (
                          <Typography variant="h6">
                            Submit Additional Payment:
                          </Typography>
                        ) : (
                          <Typography variant="h6">New Plan:</Typography>
                        )}
                      </Grid>
                      <Grid item>
                        {this.state.details.paymentExpiration ? (
                          <Typography>
                            If you make another payment before your pay period
                            expires, you will receive a multiplier based on how
                            many days remain in your plan. For example, paying
                            1,000 birr with 10 days remaining will increase your
                            monthly payment by 3,000 birr for the next 10 days.
                          </Typography>
                        ) : (
                          <Typography>
                            Higher monthly payment will give more exposure to
                            coupons. If you submit another payment plan before
                            an existing one is verified, the old plan will be
                            ignored.
                          </Typography>
                        )}
                      </Grid>

                      {this.state.details.paymentExpiration ? (
                        <div></div>
                      ) : (
                        <Grid item style={Styles.rowCentered}>
                          <Typography>Period:</Typography>

                          <List component="nav" aria-label="Device settings">
                            <ListItem
                              button
                              aria-haspopup="true"
                              aria-controls="lock-menu"
                              aria-label="when device is locked"
                              onClick={this.handleClick}
                            >
                              <ListItemText
                                primary={Constants.plans[this.state.planIndex]}
                              />
                            </ListItem>
                          </List>
                          <Menu
                            id="simple-menu"
                            anchorEl={this.state.anchor}
                            keepMounted
                            open={Boolean(this.state.anchor)}
                            onClose={this.handleClosePlan}
                          >
                            {Constants.plans.map((option, index) => (
                              <MenuItem
                                key={option}
                                selected={index === this.state.planIndex}
                                onClick={event =>
                                  this.handlePlanItemClick(event, index)
                                }
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </Menu>
                        </Grid>
                      )}
                      <Grid item style={Styles.rowCentered}>
                        <Typography style={{ marginRight: "4px" }}>
                          Amount:
                        </Typography>

                        <CurrencyInput id="amount" suffix=" birr" />
                      </Grid>
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
                            Your account will not be charged; this is used only
                            for verification. After you submit a payment
                            request, you must complete the payment within 48
                            hours. Once payment is received, your request will
                            be processed within 24 hours
                          </Typography>
                        </Grid>
                      ) : (
                        <Grid item>
                          <Typography>
                            For cash transactions, a Kinashe employee will come
                            collect payment for an additional fee of 100 birr.
                            Once payment is collected, your request will be
                            processed within 24 hours
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
                  >
                    Submit Payment
                  </Button>
                </Grid>
              </Paper>
            </form>
          </Container>
        ) : null}
      </div>
    );
  }
}

export default PaymentDetails;
