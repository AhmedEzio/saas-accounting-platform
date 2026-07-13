export const register = async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password) {
        return sendAuthResponse(
          res,
          400,
          false,
          "Name, email, and password are required",
        );
      }
  
      const normalizedData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: password,
        // Public registration must never trust role from the request body.
        role: role || "accountant",
      };
  
      const user = await User.create(normalizedData);
  
      const token = signToken(user._id);
  
      return sendAuthResponse(res, 201, true, "User registered successfully", {
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((err) => err.message)
          .join(", ");
  
        return sendAuthResponse(res, 400, false, `Validation error: ${messages}`);
      }
  
      if (error.code === 11000) {
        return sendAuthResponse(
          res,
          400,
          false,
          "Email already registered. Please use a different email or try logging in.",
        );
      }
  
      next(error);
    }
  };