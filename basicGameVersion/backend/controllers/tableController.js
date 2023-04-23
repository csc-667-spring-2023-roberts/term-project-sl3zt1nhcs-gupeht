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

tableController.removePlayerFromTable = (req, res, next) => {
  const { tableId, playerId } = req.params;
  tableModel.removePlayerFromTable(tableId, playerId)
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      next(err);
    });
};

tableController.getTableById = (req, res, next) => {
  const { tableId } = req.params;
  tableModel.getTableById(tableId)
    .then((table) => {
      res.status(200).json({ table });
    })
    .catch((err) => {
      next(err);
    });
};

tableController.getAllTables = (req, res, next) => {
  tableModel.getAllTables()
    .then((tables) => {
      res.status(200).json({ tables });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = tableController;
