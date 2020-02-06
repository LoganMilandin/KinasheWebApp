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
import AdRequest from "./AdRequest";
import Zemen from "zemen";
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
 * Emmanuel's page for verifying advertisements
 */
class Admin_VerifyAds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ads: []
    };
    this.updateAds();
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

  openAddPayments = () => {
    this.props.history.push("/admin_verifyPaymentAddons");
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
   * updates ad content of page by re-querying firebase
   */
  updateAds = () => {
    firebase.getAdRequestsADMIN((ads, error) => {
      if (error) {
        alert(error.message);
      } else {
        ads.forEach(ad => {
          ad.start = Zemen.toEC(new Date(ad.start)).toString();
        });
        this.setState({ ads });
      }
    });
  };

  /**
   * activates the given ad(for use after payment is received)
   *
   * @param {object} ad the details for the ad to be verified
   */
  activateAd = ad => {
    if (window.confirm("Activate this advertisement?"))
      firebase.verifyAdRequestADMIN(ad, error => {
        if (error) {
          alert(error.message);
        } else {
          this.updateAds();
        }
      });
  };

  /**
   * deletes the given ad
   *
   * @param {object} ad the details for the ad to be deleted
   */
  deleteAd = ad => {
    if (window.confirm("Delete this advertisement request?"))
      firebase.deleteAdRequestADMIN(ad, error => {
        if (error) {
          alert(error.message);
        } else {
          this.updateAds();
        }
      });
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
              Pending Advertisement Requests:
            </Typography>

            <Grid
              container
              direction="column"
              justify="space-between"
              alignItems="stretch"
            >
              {this.state.ads.map((ad, index) => (
                <AdRequest
                  key={index.toString()}
                  details={ad}
                  activate={this.activateAd}
                  delete={this.deleteAd}
                />
              ))}
            </Grid>
          </Paper>
        </Container>
      </div>
    );
  }
}

export default Admin_VerifyAds;
