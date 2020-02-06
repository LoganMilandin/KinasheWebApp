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
  backgroundColor: "Gainsboro" //TODO: color is gray when old, [some other color] when active (check date).
};
class AccountRequest extends Component {
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
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            Company: {this.props.details.companyName}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Email: {this.props.details.email}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Phone: {this.props.details.phone}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Owner Email: {this.props.details.ownerInfo.personalEmail}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Owner Phone: {this.props.details.ownerInfo.personalPhone}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Description: {this.props.details.description}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Database path: {this.props.details.path.toString()}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Employee: {this.props.details.employee}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Time Created:{" "}
            {new Date(this.props.details.accountCreatedTime).toString()}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Proof of ownership:
            <a href={this.props.details.proof}>view</a>
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              this.props.verify(this.props.details);
            }}
          >
            Verify
          </Button>
          <Button
            size="small"
            color="secondary"
            onClick={() => {
              this.props.delete(this.props.details);
            }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default AccountRequest;
