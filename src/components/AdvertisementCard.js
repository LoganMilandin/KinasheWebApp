import React, { Component } from "react";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Container from "@material-ui/core/Container";
import * as Constants from "../Constants/constants";

const active = {
  marginTop: 8,
  padding: 8,
  marginLeft: 24,
  marginRight: 24,
  marginBottom: 8,
  display: "flex",
  maxHeight: "md",
  backgroundColor: Constants.BROWN
};
const inactive = {
  color: Constants.DISABLED_TEXT_COLOR,
  marginTop: 8,
  padding: 8,
  marginLeft: 24,
  marginRight: 24,
  marginBottom: 8,
  display: "flex",
  maxHeight: "md",
  backgroundColor: Constants.GRAY
};

/**
 * represents a single ad, displaying corresponding info from database
 */
class AdvertisementCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      component: "img",
      alt: props
    };
  }

  render() {
    return (
      <Card style={this.props.details.active ? active : inactive}>
        <div style={{ width: "75%" }}>
          <div>
            <CardContent style={{ width: "90%" }}>
              <Typography gutterBottom variant="h5" component="h2">
                <span
                  style={
                    this.props.details.active
                      ? { color: "rgb(0, 255, 0)", marginRight: "1%" }
                      : {
                          color: "rgba(255, 26, 26, .6)",
                          marginRight: "1%"
                        }
                  }
                >
                  [{this.props.details.active ? "Active" : "Inactive"}]
                </span>
                {this.props.details.title}{" "}
              </Typography>
              <Typography variant="body2" component="p">
                Message: {this.props.details.message}{" "}
              </Typography>
              <Typography variant="body2" component="p">
                Start Date: {this.props.details.start} (lasts 10 days){" "}
              </Typography>
            </CardContent>
            <CardActions display={"flex"}>
              <Button
                color="secondary"
                disabled={this.props.details.active}
                onClick={this.props.delete}
              >
                Delete
              </Button>
            </CardActions>
          </div>
        </div>

        <Container
          style={{
            width: "25%",
            marginTop: "auto",
            marginBottom: "auto",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <CardMedia component="img" src={this.props.details.imageUrl} />
        </Container>
      </Card>
    );
  }
}

export default AdvertisementCard;
