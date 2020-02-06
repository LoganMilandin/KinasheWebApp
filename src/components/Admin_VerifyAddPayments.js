import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import AppBar from "@material-ui/core/AppBar";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import { Toolbar } from "@material-ui/core";
import firebase from "./FirebaseInteraction";
import PaymentCard from "./PaymentCard";
import logoNoWords from "../images/KinasheLogoNoWords.png";
const accountContainer = {
  marginTop: "3%"
};
const paper = {
  padding: 12,
  marginBottom: 24,
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  backgroundColor: "AliceBlue"
};

/**
 * Emmanuel's page for verifying payment add-ons
 */
class Admin_VerifyAddPayments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      additionalPayments: []
    };
    this.updatePayments();
  }

  /**
   * bundle of methods for nav menu
   */
  handleMenu = event => {
    this.setState({ anchor: event.currentTarget });
  };
  handleClose = () => {
    this.setState({ anchor: null });
  };
  openNewPayments = () => {
    this.props.history.push("/admin_verifyNewPayments");
  };
  openAccountRequests = () => {
    this.props.history.push("/admin_verifyAccounts");
  };

  openAdRequests = () => {
    this.props.history.push("/admin_verifyAds");
  };

  /**
   * logs the current admin out, same as logging a regular user out
   *
   */
  handleSignOut = () => {
    if (window.confirm("Log out?")) {
      firebase.logout(error => {
        if (error) {
          alert("error logging out: " + error.message);
        } else {
          this.props.history.push("/");
        }
      });
    }
  };

  /**
   * updates payment requests on admin screen by re-querying database
   *
   */
  updatePayments = () => {
    firebase.getPaymentRequestsADMIN(false, (payments, error) => {
      if (error) {
        alert("error getting payment requests: " + error.message);
      } else {
        this.setState({ additionalPayments: payments });
      }
    });
  };

  /**
   * verififes an addition to an existing payment plan
   *
   * @param {object} details the details for the plan to be verified
   */
  verifyPayment = details => {
    if (window.confirm("Verify this payment?")) {
      firebase.verifyAdditionalPaymentADMIN(details, error => {
        if (error) {
          alert("error verifing payment: " + error.message);
        } else {
          this.updatePayments(false);
        }
      });
    }
  };

  /**
   * deletes a payment request, for use if a payment hasn't been received after
   * a certain time
   *
   * @param {object} details the details of the plan to delete
   *
   */
  deletePayment = details => {
    if (window.confirm("Delete this payment?")) {
      firebase.deletePaymentADMIN(false, details, error => {
        if (error) {
          alert("error deleting payment: " + error.message);
        } else {
          this.updatePayments();
        }
      });
    }
  };

  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <div style={{ marginRight: "10px" }}>
              <img
                style={{ maxHeight: "40px" }}
                src={logoNoWords}
                alt={"Kinashe Logo"}
              />
            </div>
            <Typography component="h1" variant="h6" style={{ flexGrow: 1 }}>
              Kinashe Admin
            </Typography>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={this.handleMenu}
              color="inherit"
            >
              <AccountCircle />
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
              <MenuItem onClick={this.openAccountRequests}>
                Account Requests
              </MenuItem>
              <MenuItem onClick={this.openNewPayments}>
                New Payment Plans
              </MenuItem>
              <MenuItem onClick={this.openAddPayments}>
                Payment Add-Ons
              </MenuItem>
              <MenuItem onClick={this.openAdRequests}>
                Advertisement Requests
              </MenuItem>
              <MenuItem onClick={this.handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" style={accountContainer}>
          <Typography
            component="h4"
            variant="h4"
            style={{ textAlign: "center" }}
            color="textPrimary"
            gutterBottom
          >
            Welcome Administrator!
          </Typography>

          <Paper style={paper}>
            <Typography variant="h5" component="h3" gutterBottom>
              Payment Add-On Requests:
            </Typography>

            <Grid
              container
              direction="column"
              justify="space-between"
              alignItems="stretch"
            >
              {this.state.additionalPayments.map(payment => (
                <PaymentCard
                  key={payment.uid}
                  details={payment}
                  verify={this.verifyPayment}
                  delete={this.deletePayment}
                />
              ))}
            </Grid>
          </Paper>
        </Container>
      </div>
    );
  }
}

export default Admin_VerifyAddPayments;
