export default function (req, res) {
  res.send(process.env.PUBLIC_API_KEY);
}