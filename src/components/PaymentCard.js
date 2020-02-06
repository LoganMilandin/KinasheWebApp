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
// represents a request for payment. Rendered on admin homepage
class PaymentCard extends Component {
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
            Company: {this.props.details.company}{" "}
            {this.props.details.electronic ? "[Electronic]" : "[Cash]"}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {this.state.electronic ? "Person Paying:" : "Account Holder:"}{" "}
            {this.props.details.accountName}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Company Phone: {this.props.details.phone}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Company Email: {this.props.details.email}
          </Typography>
          {this.props.details.payElectronically ? (
            <Typography variant="body2" color="textSecondary" component="p">
              Account Number: {this.props.details.accountNumber}
            </Typography>
          ) : (
            <div></div>
          )}
          {this.props.details.period ? (
            <Typography variant="body2" color="textSecondary" component="p">
              Payment Period: {this.props.details.period}
            </Typography>
          ) : null}
          {this.props.details.currentPayment ? (
            <Typography variant="body2" color="textSecondary" component="p">
              Existing Monthly Payment: {this.props.details.currentPayment}
            </Typography>
          ) : null}

          <Typography variant="body2" color="textSecondary" component="p">
            Amount: {this.props.details.amount}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Time of Request: {this.props.details.requestTime}
          </Typography>
          {this.props.details.expiration ? (
            <Typography variant="body2" color="textSecondary" component="p">
              Pay Period Expiration:{" "}
              {new Date(this.props.details.expiration).toString()}
            </Typography>
          ) : null}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => this.props.verify(this.props.details)}
          >
            Verify
          </Button>
          <Button
            size="small"
            color="secondary"
            onClick={() =>
              this.props.delete(
                !Boolean(this.props.details.currentPayment),
                this.props.details
              )
            }
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default PaymentCard;
