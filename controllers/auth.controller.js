import authService from "../services/auth.service.js";
class AuthController {
  //signUp
  async signUp(req, res) {
    try {
      const result = await authService.signUpService(req, res);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async login(req, res) {
    try {
      const result = await authService.loginService(req, res);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthController();
