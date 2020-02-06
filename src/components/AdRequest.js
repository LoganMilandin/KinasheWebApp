import React, { Component } from "react";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";

const card = {
  marginTop: 8,
  padding: 8,
  marginLeft: 24,
  marginRight: 24,
  marginBottom: 8,
  maxHeight: "md",
  backgroundColor: "Gainsboro"
};

/**
 * represents a single coupon, displaying corresponding info from database
 */
class AdRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      component: "img",
      alt: props
    };
  }

  render() {
    return (
      <Card style={card}>
        <div>
          <CardContent style={{ width: "90%" }}>
            <Typography gutterBottom variant="h5" component="h2">
              Company: {this.props.details.company}{" "}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Payment Type:{" "}
              {this.props.details.payElectronically ? "electronic" : "cash"}{" "}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Person Paying: {this.props.details.accountName}
            </Typography>
            {this.props.details.payElectronically ? (
              <Typography variant="body2" color="textSecondary" component="p">
                Account Number: {this.props.details.accountNumber}
              </Typography>
            ) : null}
            <Typography variant="body2" color="textSecondary" component="p">
              Title: {this.props.details.title}{" "}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Message: {this.props.details.message}{" "}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Start Date: {this.props.details.start} (lasts 10 days){" "}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Image:
              <a href={this.props.details.imageUrl}>view</a>
            </Typography>
          </CardContent>
          <CardActions display={"flex"}>
            <Button
              color="primary"
              onClick={() => this.props.activate(this.props.details)}
            >
              Activate
            </Button>
            <Button
              color="secondary"
              onClick={() => this.props.delete(this.props.details)}
            >
              Delete
            </Button>
          </CardActions>
        </div>
      </Card>
    );
  }
}

export default AdRequest;
