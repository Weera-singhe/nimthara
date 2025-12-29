// utils/dateFormat.js

const date6Con = (h) => ` TO_CHAR(${h}, 'YYMMDD') AS ${h}_x`;
const dateTimeCon = (h) => ` TO_CHAR(${h}, 'YYYY-MM-DD @ HH24:MI') AS ${h}_t`;
const dateTimeInpCon = (h) => `TO_CHAR(${h}, 'YYYY-MM-DD"T"HH24:MI') AS ${h}_i`;
const dateCon = (h) => `TO_CHAR(${h}, 'YYYY-MM-DD') AS ${h}_`;

module.exports = {
  date6Con,
  dateTimeCon,
  dateTimeInpCon,
  dateCon,
};
