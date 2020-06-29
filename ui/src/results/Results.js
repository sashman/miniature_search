import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
    backgroundColor: theme.palette.primary.dark,
  },
  tableBody: {
    backgroundColor: theme.palette.primary.dark,
    color: "white",
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

function Results({ data }) {
  const classes = useStyles();
  return data.results ? (
    <div className="Results">
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          {/* <TableHead>
            <TableRow>
              <TableCell align="right">Calories</TableCell>
            </TableRow>
          </TableHead> */}
          <TableBody classes={{ root: classes.tableBody }}>
            {data.results.map(
              ({
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
              }) => (
                <TableRow key={id}>
                  <TableCell align="left">{toName(name, title)}</TableCell>
                  <TableCell align="left">{race}</TableCell>
                  <TableCell align="left">{website}</TableCell>
                  <TableCell align="left">{price}</TableCell>
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
