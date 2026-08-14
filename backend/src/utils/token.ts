import jwt from "jsonwebtoken";
export const generateToken = (userId: number, role: string): string => {

return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET as string,
    {
        expiresIn: "15m",
    }
);

};

export const generateRefreshToken = (userId: number, role: string): string => {
return jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET as string,
    {
        expiresIn: "7d",
    }
);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
}