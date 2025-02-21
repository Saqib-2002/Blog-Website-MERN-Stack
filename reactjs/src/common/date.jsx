const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const getDay = (timeStamp) => {
  const date = new Date(timeStamp);
  return `${date.getDate()} ${months[date.getMonth()]}`;
};
<<<<<<< HEAD
=======

export const getFullDay = (timeStamp) => {
  const date = new Date(timeStamp);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
