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
import AccountRequest from "./AccountRequest";
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
 * Emmanuel's page for verifying accounts
 */
class Admin_VerifyAccounts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };
    this.updateAccounts();
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
  openAddPayments = () => {
    this.props.history.push("/admin_verifyPaymentAddons");
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
   * each time an account is verified, Firebase is queried again to get all
   * unverified accounts. New accounts will appear, and the one just verified
   * should disappear
   */
  updateAccounts = () => {
    firebase.getUnverifiedAccountsADMIN((users, error) => {
      if (error) {
        alert(
          "error getting account: " +
            error.path +
            ". The server responded with this message: " +
            error.message
        );
      } else {
        users = users.sort((a, b) => {
          if (a.accountCreatedTime < b.accountCreatedTime) {
            return -1;
          } else if (a.accountCreatedTime > b.accountCreatedTime) {
            return 1;
          } else {
            return 0;
          }
        });
        this.setState({ users });
      }
    });
  };

  /**
   * verifies the account with given details. All this means is that the
   * corresponding user collection is flagged as verified
   *
   * @param {object} details the database collection belonging to the user to be verified
   */
  verifyAccount = details => {
    if (window.confirm("Verify this account?")) {
      firebase.verifyAccountADMIN(details, error => {
        if (error) {
          alert("error verifing account: " + error.message);
        } else {
          this.updateAccounts();
        }
      });
    }
  };

  /**
   * deletes account with given details from database, although it doesn't
   * actually remove the user
   *
   * @param {object} details the details for the account to delete
   */
  deleteAccount = details => {
    if (window.confirm("Delete this account?")) {
      firebase.deleteUserDataADMIN(details, error => {
        if (error) {
          alert("error deleting account: " + error.message);
        } else {
          this.updateAccounts();
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
              Pending Account Requests:
            </Typography>

            <Grid
              container
              direction="column"
              justify="space-between"
              alignItems="stretch"
            >
              {this.state.users.map(user => (
                <AccountRequest
                  key={user.email}
                  details={user}
                  verify={this.verifyAccount}
                  delete={this.deleteAccount}
                />
              ))}
            </Grid>
          </Paper>
        </Container>
      </div>
    );
  }
}

export default Admin_VerifyAccounts;
