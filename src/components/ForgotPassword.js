import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import firebase from "./FirebaseInteraction";
import * as Styles from "../Constants/Styling";

/**
 * UI to send a password reset email
 */
class ForgotPassword extends Component {
  /**
   * sends a password reset email if possible, alerting if
   * it's not sent
   */
  handleSubmit = event => {
    event.preventDefault();
    firebase.sendPasswordResetEmail(event.target.email.value, error => {
      if (error) {
        alert("error sending password reset email: " + error.message);
        return;
      }
      alert("Email sent. Check your inbox to reset your password");
      this.props.history.push("/");
    });
  };

  render() {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div style={Styles.sectionPaper}>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          <Typography>
            Enter the email associated with this account and you will receive a
            link to reset your password
          </Typography>
          <form style={{ width: "100%" }} onSubmit={this.handleSubmit}>
            <TextField
              onChange={this.onChangeEmail}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
            />
            <Button type="submit" fullWidth variant="contained" color="primary">
              Send Link
            </Button>
          </form>
        </div>
      </Container>
    );
  }
}

export default ForgotPassword;
