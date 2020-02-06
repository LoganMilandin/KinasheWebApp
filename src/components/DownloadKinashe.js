import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

class DownloadKinashe extends Component {
  render() {
    return (
      <Typography component="h1" variant="h5">
        Kinashe app will be downloaded from this page
      </Typography>
    );
  }
}

export default DownloadKinashe;

/*export default function DownloadKinashe() {
  const classes = useStyles();
  return (
    <div className={classes.paper}>
      <Typography component="h1" variant="h5">
        Kinashe app will be downloaded from this page
      </Typography>
    </div>
  );
}*/
