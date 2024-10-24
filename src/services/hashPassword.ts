import bcrypt from "bcryptjs";

const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt_rounds = Number(process.env.SALT_ROUNDS!);
    const salt = await bcrypt.genSalt(salt_rounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (err) {
    throw new Error("Error hashing the password");
  }
};

export default hashPassword;
