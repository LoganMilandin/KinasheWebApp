import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Menu from "@material-ui/core/Menu";
import Box from "@material-ui/core/Box";
import AdvertisementCard from "./AdvertisementCard";
import MenuItem from "@material-ui/core/MenuItem";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import { Toolbar } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import firebase from "./FirebaseInteraction";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Zemen from "zemen";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import * as Constants from "../Constants/constants";
import * as Styles from "../Constants/Styling";

/**
 * UI for submitting payment requests. Handles both new plans and additional payments,
 * handles both cash and bank transaction requests
 */
class AppAdvertisements extends Component {
  constructor(props) {
    super(props);
    firebase.getAdvertisements((ads, error) => {
      if (error) {
        alert(error.message);
      } else {
        ads.forEach(ad => {
          ad.start = Zemen.toEC(new Date(ad.start)).toString();
        });
        this.setState({
          ads,
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
  openPayment = () => {
    this.props.history.push("/payment");
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
   * updates list of advertisements for this business(real-time, from db)
   */
  updateAdvertisements = () => {
    firebase.getAdvertisements((ads, error) => {
      if (error) {
        alert(error.message);
      } else {
        ads.forEach(ad => {
          ad.start = Zemen.toEC(new Date(ad.start)).toString();
        });
        this.setState({
          ads,
          anchor: null,
          menuAnchor: null
        });
      }
    });
  };

  /**
   * deletes the advertisement with given index from database
   *
   * @param {number} index the index of the coupon from the ad page. Note:
   * this does not match the index of the coupon in the advertisements section of
   * db
   */
  deleteAdvertisement = index => {
    let ad = this.state.ads[index];
    //can't delete advertisements that are already active. Button is also
    //disabled on UI if ad is active
    if (!ad.active && window.confirm("Delete this advertisement request?")) {
      firebase.deleteAdRequest(ad, error => {
        if (error) {
          alert(error.message);
        } else {
          this.updateAdvertisements();
        }
      });
    }
  };

  render() {
    return (
      <div>
        <AppBar position="static" style={{ backgroundColor: Constants.BROWN }}>
          <Toolbar>
            <LocalAtmIcon style={{ marginRight: "8px" }} />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Advertising
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
              <MenuItem onClick={this.openPayment}>Payment Options</MenuItem>
              <MenuItem disabled>Premium Advertisements</MenuItem>
              <MenuItem onClick={this.handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        {this.state ? (
          <Container maxWidth="md">
            {/*tbh idk when to use grid vs box*/}
            <Paper style={Styles.sectionPaperTight}>
              <Box display={"flex"} p={1}>
                <Box p={1} flexGrow={1}>
                  <Typography
                    style={{ fontSize: "25px" }}
                    variant="h4"
                    component="h3"
                  >
                    Advertisements
                  </Typography>
                </Box>
                <Box p={1} style={{ padding: "0px", margin: "0px" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    style={Styles.buttonPrimary}
                    onClick={() => {
                      this.props.history.push("/create-ad");
                    }}
                  >
                    {" "}
                    New Ad{" "}
                  </Button>
                </Box>
              </Box>

              <Grid
                container
                direction="column"
                justify="space-between"
                alignItems="stretch"
              >
                {this.state.ads.map((coupon, index) => (
                  <Grid key={index} item style={{ width: "100%" }}>
                    <AdvertisementCard
                      delete={() => {
                        this.deleteAdvertisement(index);
                      }}
                      details={coupon}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Container>
        ) : null}
      </div>
    );
  }
}

export default AppAdvertisements;
