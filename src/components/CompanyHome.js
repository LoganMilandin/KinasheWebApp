import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Paper from "@material-ui/core/Paper";
import CouponCard from "./CouponCard";
import { Toolbar } from "@material-ui/core";
import firebase from "./FirebaseInteraction";
import logoNoWords from "../images/KinasheLogoNoWords.png";
import * as Constants from "../Constants/constants";
import * as Styles from "../Constants/Styling";

/**
 * a business owner's homepage, which renders account details as well as coupons with
 * options to add or modify. The route for this component is protected, meaning it can't
 * be accessed unless a user logs in first
 */
class CompanyHome extends Component {
  constructor(props) {
    super(props);
    //get a snapshot of this user's account, including coupons, then persist it in state
    setTimeout(() => {
      if (!this.state) {
        alert("could not find account. This account may have been deleted");
        firebase.logout(() => {
          this.props.history.push("/");
        });
      }
    }, 5000);
    firebase.getUserAccountDetails((accountDetails, error) => {
      if (error) {
        alert("error accessing account: " + error.message);
      } else {
        let coupons = [];
        //if the user has created any coupons
        if (accountDetails.coupons) {
          coupons = accountDetails.coupons;
        }
        this.setState({ accountDetails, coupons });
      }
    });
  }

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
   * bundle of methods for nav menu
   */
  handleMenu = event => {
    this.setState({ anchor: event.currentTarget });
  };
  handleClose = () => {
    this.setState({ anchor: null });
  };
  openAccount = () => {
    this.props.history.push("/account");
  };
  openSettings = () => {
    this.props.history.push("/settings");
  };
  openPayment = () => {
    this.props.history.push("/payment");
  };
  openAdvertisements = () => {
    this.props.history.push("/advertisements");
  };

  /**
   * redirects user to edit coupon page, but sets
   * coupon index in local storage so its information
   * will be loaded onto page
   *
   * @param {number} index the index of the coupon clicked
   */
  editCoupon = index => {
    console.log(index);
    sessionStorage.setItem("couponIndex", index);
    this.props.history.push("/edit");
  };

  /**
   * deletes a coupon with given index from the user's collection
   *
   * @param {number} index the index of the coupon to delete
   */
  deleteCoupon = index => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      let coupons = this.state.coupons;
      coupons.splice(index, 1);
      firebase.deleteCoupon(this.state.accountDetails, coupons, error => {
        if (error) {
          alert("error deleting coupon: " + error.message);
        } else {
          this.setState({ coupons });
        }
      });
    }
  };

  render() {
    return (
      <div>
        <AppBar position="static" style={{ backgroundColor: Constants.BROWN }}>
          <Toolbar>
            <div style={{ marginRight: "10px" }}>
              <img
                style={{ maxHeight: "40px" }}
                src={logoNoWords}
                alt={"Kinashe Logo"}
              />
            </div>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Kinashe Home
            </Typography>
            {this.state ? (
              <div>
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
                  <MenuItem disabled>Home</MenuItem>
                  <MenuItem onClick={this.openAccount}>My Account</MenuItem>
                  <MenuItem onClick={this.openSettings}>Settings</MenuItem>
                  <MenuItem onClick={this.openPayment}>
                    Payment Options
                  </MenuItem>
                  <MenuItem onClick={this.openAdvertisements}>
                    Premium Advertisements
                  </MenuItem>
                  <MenuItem onClick={this.handleSignOut}>Sign Out</MenuItem>
                </Menu>
              </div>
            ) : null}
          </Toolbar>
        </AppBar>

        {this.state ? (
          <Container maxWidth="md">
            <Paper style={Styles.sectionPaperTight}>
              <Typography
                component="h4"
                variant="h4"
                style={{ textAlign: "center" }}
                gutterBottom
              >
                Welcome {this.state.accountDetails.companyName}!
              </Typography>
              <Typography
                variant="h6"
                style={{ textAlign: "center" }}
                color={"initial"}
              >
                View, modify, or add coupons.
              </Typography>
            </Paper>
            {/*tbh idk when to use grid vs box*/}
            <Paper style={Styles.sectionPaperTight}>
              <Box display={"flex"} p={1}>
                <Box p={1} flexGrow={1}>
                  <Typography variant="h4" component="h3">
                    Coupons
                  </Typography>
                </Box>
                <Box p={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    style={Styles.buttonPrimary}
                    onClick={() => {
                      this.props.history.push("/create");
                    }}
                  >
                    {" "}
                    New Coupon{" "}
                  </Button>
                </Box>
              </Box>

              <Grid
                container
                direction="column"
                justify="space-between"
                alignItems="stretch"
              >
                {this.state.coupons.map((coupon, index) => (
                  <Grid key={index} item style={{ width: "100%" }}>
                    <CouponCard
                      edit={() => {
                        this.editCoupon(index);
                      }}
                      delete={() => {
                        this.deleteCoupon(index);
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

export default CompanyHome;
