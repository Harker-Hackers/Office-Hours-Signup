import { Response } from "express";

export default (
    res: Response<any, Record<string, any>>,
    code: number,
    message?: string
) => {
    res.status(code);
    res.render("error.ejs", { message: message });
};
