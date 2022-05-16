import { Req, Res } from "../types";

export default (req: Req, res: Res) => {
    res.render("development.ejs");
}