const tableModel = require('../models/table/tableModel');

const tableController = {};

tableController.createTable = (req, res, next) => {
  const { tableName } = req.body;
  tableModel.createTable(tableName)
    .then((tableId) => {
      res.status(200).json({ tableId });
    })
    .catch((err) => {
      next(err);
    });
};

/*

todo

tableController.addPlayersToTable = (req, res, next) => {
  const { tableId, playerIds } = req.body;
  tableModel.addPlayersToTable(tableId, playerIds)
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      next(err);
    });
};

*/



module.exports = tableController;
