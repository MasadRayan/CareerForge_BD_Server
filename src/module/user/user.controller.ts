import { Request, Response } from "express";


const createUser = async(req: Request, res: Response) => {
    console.log(req.body)
    res.status(200).json({
        success: true,
        message: "User created"
    })
}


export const userController = {
    createUser
}