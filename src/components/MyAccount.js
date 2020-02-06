import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Paper from "@material-ui/core/Paper";
import Toolbar from "@material-ui/core/Toolbar";
import firebase from "./FirebaseInteraction";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import Box from "@material-ui/core/Box";
import * as Constants from "../Constants/constants";
import * as Styles from "../Constants/Styling";
import Zemen from "zemen";

/**
 * a business owner's account page, which renders account details.
 */
class MyAccount extends Component {
  constructor(props) {
    super(props);
    firebase.getUserAccountDetails((account, error) => {
      if (error) {
        alert("error getting account details: " + error.message);
      } else {
        this.setState(account);
      }
    });
  }

  /**
   * bundle of methods for the appbar navigation.
   */
  handleMenu = event => {
    this.setState({ anchor: event.currentTarget });
  };
  handleClose = () => {
    this.setState({ anchor: null });
  };
  openHome = () => {
    this.props.history.push("/home");
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

  render() {
    return (
      <div>
        <AppBar position="static" style={{ backgroundColor: Constants.BROWN }}>
          <Toolbar>
            <InfoIcon style={{ marginRight: "8px" }} />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Account Information
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
              <MenuItem onClick={this.openHome}>Home</MenuItem>
              <MenuItem disabled>My Account</MenuItem>
              <MenuItem onClick={this.openSettings}>Settings</MenuItem>
              <MenuItem onClick={this.openPayment}>Payment Options</MenuItem>
              <MenuItem onClick={this.openAdvertisements}>
                Premium Advertisements
              </MenuItem>
              <MenuItem onClick={this.handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        {this.state ? (
          <Container maxWidth="md">
            <Paper style={Styles.sectionPaper}>
              <Typography variant="h5" component="h5" gutterBottom>
                Photo Gallery
              </Typography>

              <Paper style={Styles.subPaperTight}>
                <Grid container alignItems={"center"}>
                  {this.state.photos.map((photo, index) => (
                    <img
                      src={photo}
                      style={Styles.photoStyle}
                      key={index}
                      alt={"company photo " + index}
                    />
                  ))}
                </Grid>
              </Paper>
            </Paper>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper style={Styles.sectionPaper}>
                  <Typography variant="h5" component="h5" gutterBottom>
                    Operating Hours:
                  </Typography>
                  <Paper style={Styles.subPaperTight}>
                    <List>
                      {Constants.days.map((day, index) => (
                        <ListItem key={day}>
                          <ListItemText primary={day} />
                          <TextField
                            disabled
                            key={day + "open"}
                            id={index.toString()}
                            label="Open"
                            type="time"
                            defaultValue={this.state.hours[index][0]}
                            onChange={this.onChangeEndHour}
                            InputLabelProps={{
                              shrink: true
                            }}
                            inputProps={{
                              step: 300 // 5 min
                            }}
                          />
                          <TextField
                            disabled
                            key={day + "close"}
                            id={index.toString()}
                            label="Close"
                            type="time"
                            defaultValue={this.state.hours[index][1]}
                            onChange={this.onChangeEndHour}
                            InputLabelProps={{
                              shrink: true
                            }}
                            inputProps={{
                              step: 300 // 5 min
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper style={Styles.sectionPaper}>
                  <Typography component="h5" variant="h5" gutterBottom>
                    Business Info
                  </Typography>
                  <Paper style={Styles.subPaper}>
                    <Box borderBottom={1}>
                      <Grid item xs={12}>
                        <Typography
                          style={{
                            //render red if not verified, green if verified
                            color: this.state.verified
                              ? "rgb(102,255,1)"
                              : "rgb(255,26,26)"
                          }}
                        >
                          {" "}
                          {this.state.verified
                            ? "Verified"
                            : "Not Verified"}{" "}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>
                          {" "}
                          Company: {this.state.companyName}{" "}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>
                          {" "}
                          Description: {this.state.description}{" "}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>
                          Business Type: {this.state.businessType}{" "}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography> Website: {this.state.website} </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography> Phone: {this.state.phone} </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography> Email: {this.state.email} </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography gutterBottom>
                          {" "}
                          Location: {this.state.lat +
                            ", " +
                            this.state.long}{" "}
                        </Typography>
                      </Grid>
                    </Box>

                    <Box borderBottom={1}>
                      <Grid item xs={12}>
                        <Typography>
                          Owner Name: {this.state.ownerInfo.firstName}{" "}
                          {this.state.ownerInfo.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>
                          Owner Phone: {this.state.ownerInfo.personalPhone}{" "}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography gutterBottom>
                          Owner Email: {this.state.ownerInfo.personalEmail}{" "}
                        </Typography>
                      </Grid>
                    </Box>

                    <Grid item xs={12}>
                      <Typography>
                        Monthly Payment: {this.state.monthlyPayment} birr
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        {this.state.paymentExpiration
                          ? "Payment Expires: " +
                            Zemen.toEC(
                              new Date(this.state.paymentExpiration)
                            ).toString()
                          : ""}
                      </Typography>
                    </Grid>
                  </Paper>
                </Paper>
                {/*TODO: Transaction history*/}
              </Grid>
            </Grid>
          </Container>
        ) : null}
      </div>
    );
  }
}

export default MyAccount;
