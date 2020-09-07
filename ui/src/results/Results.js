import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Link from "@material-ui/core/Link";
import LaunchIcon from "@material-ui/icons/Launch";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  tableBody: {
    color: "white",
  },
  tableCell: {
    color: "white",
    padding: "6px",
  },
}));

const contains = (a, b) =>
  a.toLowerCase().trim().includes(b.toLowerCase().trim());

const toName = (name, title) => {
  if (name && title && !contains(name, title)) {
    return `${name}: ${title}`;
  }

  if (name) {
    return name;
  }

  return title;
};

const formatWebsite = (value) => value.replace(/www\./, "");

const formatCurrency = (value) => `£${value}`;

function Results({ data }) {
  const classes = useStyles();
  return data.results ? (
    <div className="Results">
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <TableBody classes={{ root: classes.tableBody }}>
            {data.results.map(
              (
                {
                  _score,
                  id,
                  game,
                  website,
                  race,
                  price,
                  faction,
                  link,
                  name,
                  title,
                  inStockQuantity,
                },
                i
              ) => (
                <TableRow
                  style={
                    i % 2
                      ? { background: "rgba(255, 255, 255, 0.05)" }
                      : { background: "rgba(255, 255, 255, 0)" }
                  }
                  key={id}
                >
                  <TableCell classes={{ root: classes.tableCell }} align="left">
                    {toName(name, title)}
                  </TableCell>
                  <TableCell classes={{ root: classes.tableBody }} align="left">
                    {race}
                  </TableCell>
                  <TableCell classes={{ root: classes.tableBody }} align="left">
                    {formatCurrency(price)}
                  </TableCell>
                  <TableCell classes={{ root: classes.tableBody }} align="left">
                    <Link
                      target="_blank"
                      href={link}
                      style={{ verticalAlign: "middle" }}
                    >
                      {formatWebsite(website)}{" "}
                      <LaunchIcon
                        style={{ verticalAlign: "middle" }}
                        fontSize="small"
                      />
                    </Link>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  ) : null;
}

export default Results;
