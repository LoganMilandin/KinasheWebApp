import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import firebase from "./FirebaseInteraction";
import logoWords from "../images/KinasheLogoWords.png";
import * as Styles from "../Constants/Styling";

//TODO: textboxes "color" is still the standard blue, but I don't mind it much. Could change tho. - Alex
/**
 * UI for user to sign in from
 */
class SignIn extends Component {
  constructor(props) {
    super(props);

    //this is so that you can't view the sign in page again after you've already
    //logged in
    if (firebase.isAdmin()) {
      this.props.history.push("/admin_verifyAccounts");
    } else if (firebase.isAuthenticated()) {
      this.props.history.push("/home");
    }
    this.state = { submitted: false };
  }

  /**
   * logs the user in. Upon logging in, old coupons and old payment
   * plans automatically expire
   *
   * @param {event} event event raised when login form is submitted
   */
  handleSubmit = event => {
    event.preventDefault();
    this.setState({ submitted: true });
    firebase.login(
      event.target.email.value,
      event.target.password.value,
      error => {
        if (error) {
          alert("Error signing in: " + error.message);
          this.setState({ submitted: false });
        } else {
          if (firebase.isAdmin()) {
            this.props.history.push("/adminHome");
          } else {
            this.props.history.push("/home");
          }
        }
      }
    );
  };

  render() {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div style={{ width: "100%", textAlign: "center" }}>
          <img style={Styles.logoMedium} src={logoWords} alt={"Kinashe Logo"} />
        </div>
        <Paper style={Styles.sectionPaper}>
          <form style={{ width: "100%" }} onSubmit={this.handleSubmit}>
            <Paper style={Styles.subPaper}>
              <TextField
                inputProps={{ maxLength: 30 }}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                style={Styles.buttonPrimary}
                disabled={this.state.submitted}
              >
                Sign In
              </Button>
            </Paper>

            <Grid item container>
              <Grid item xs={12} sm={6}>
                <Link href={"/forgot"} variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item xs={12} sm={6} align={"right"}>
                <Link href={"/signup"} variant="body2">
                  {"Create Account"}
                </Link>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Link href={"/contact"} variant={"body2"}>
                  Contact an Admin
                </Link>
              </Grid>
              <Grid item xs={12} sm={6} align={"right"}>
                <Link href={"/download"} variant={"body2"}>
                  Download Kinashe
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    );
  }
}

export default SignIn;
