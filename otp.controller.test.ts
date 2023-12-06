const OTPController = require('../controllers/otp.controller');
const UserRepository = require('../repositories/user.repository');
const OTPRepository = require('../repositories/otp.repository');
const { sendSMSOTP, sendMailOTP, verifyOTP } = require('../utils/otp');


jest.mock('../repositories/user.repository');
jest.mock('../repositories/otp.repository');
jest.mock('../utils/otp');

describe('OTPController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // sendSMSOTP
  describe('sendSMSOTP', () => {
    it('should return success message when SMS OTP is sent successfully', async () => {
    
      const req = { body: { user_id: 'someUserId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      UserRepository.findOne.mockResolvedValueOnce({ id: 'someUserId' , phone_no: '1234567890' });
      OTPRepository.findOne.mockResolvedValue({ user_id: 'someUserId', type: 'sms', otp: '123456' });

      sendSMSOTP.mockResolvedValueOnce({ success: true, message: 'SMS sent successfully' });

      await OTPController.sendSMSOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
         success: true, 
         message: 'SMS sent successfully' 
        });
    });

    it('should return error message when user is not found', async () => {
     
      const req = { body: { user_id: 'nonExistentUserId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      UserRepository.findOne.mockResolvedValueOnce(null);

      await OTPController.sendSMSOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'User not found!' 
      });
    });

    it('should handle failure to send SMS OTP', async () => {
   
      const req = { body: { user_id: 'someUserId'} };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      UserRepository.findOne.mockResolvedValueOnce({ id: 'someUserId', phone_no: '1234567890' });

      sendSMSOTP.mockResolvedValueOnce({ success: false, message: 'Failed to send SMS' });

      await OTPController.sendSMSOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Failed to send SMS' });
    });
  });
    

  // sendMAILOTP
  describe('sendMailOTP', () => {
    it('should return success message when Mail OTP is sent successfully', async () => {

      const req = { body: { user_id: 'someUserId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      UserRepository.findOne.mockResolvedValueOnce({ 
        id: 'someUserId', 
        email: 'test@example.com' 
      });
      sendMailOTP.mockResolvedValueOnce({ 
        success: true, 
        message: 'Mail sent successfully' 
      });

      await OTPController.sendMailOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Mail sent successfully' 
      });
    });

    it('should return error message when user is not found', async () => {
     
      const req = { body: { user_id: 'nonExistentUserId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      UserRepository.findOne.mockResolvedValueOnce(null);

      await OTPController.sendMailOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'User not found!' 
      });
    });

    it('should handle failure to send mail OTP', async () => {
      
      const req = { body: { user_id: 'someUserId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      UserRepository.findOne.mockResolvedValueOnce({ 
        id: 'someUserId', 
        email: 'test@example.com' 
      });
      sendMailOTP.mockResolvedValueOnce({ 
        success: false, 
        message: 'Failed to send mail' 
      });

      await OTPController.sendMailOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Failed to send mail' 
      });
    });
  });


  // verfiyOTP
  describe('verifyOTP', () => {
    it('should verify OTP successfully for mail type', async () => {

      const req = { body: { 
        user_id: 'someUserId', 
        otp: '1234', 
        type: 'mail' 
      } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      OTPRepository.findOne.mockResolvedValueOnce({ 
        user_id: 'someUserId', 
        type: 'mail', 
        otp: '1234', 
        expiry_time: Date.now() + 5 * 60 * 1000 
      });
      UserRepository.updateOne.mockResolvedValueOnce(true);

      await OTPController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ 
        success: true, 
        message: 'OTP verified successfully!' 
      });
    });

    it('should verify OTP successfully for SMS type', async () => {
     
      const req = { body: { 
        user_id: 'someUserId', 
        otp: '1234', 
        type: 'sms' 
      } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      OTPRepository.findOne.mockResolvedValueOnce({ 
        user_id: 'someUserId', 
        type: 'sms', 
        otp: '1234', 
        expiry_time: Date.now() + 5 * 60 * 1000
      });
      UserRepository.updateOne.mockResolvedValueOnce(true);

      await OTPController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ 
        success: true, 
        message: 'OTP verified successfully!' 
      });
    });

    it('should handle user not found during OTP verification', async () => {
    
      const req = { body: { 
        user_id: 'nonExistentUserId', 
        otp: '1234', 
        type: 'mail' 
      } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      OTPRepository.findOne.mockResolvedValueOnce(null);

      await OTPController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'User not found!' });
    });

    it('should handle expired or invalid OTP', async () => {
     
      const req = { body: { 
        user_id: 'someUserId', 
        otp: '1234', 
        type: 'mail' 
      } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      OTPRepository.findOne.mockResolvedValueOnce({ 
        user_id: 'someUserId', 
        type: 'mail', 
        otp: '5678', 
        expiry_time: Date.now() + 5 * 60 * 1000
      });

      await OTPController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'OTP has expired or is invalid' });
    });

    it('should handle invalid OTP during verification', async () => {
      
      const req = { body: { 
        user_id: 'someUserId', 
        otp: '1234', 
        type: 'mail' 
      } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      OTPRepository.findOne.mockResolvedValueOnce({ 
        user_id: 'someUserId', 
        type: 'mail', 
        otp: '5678', 
        expiry_time: Date.now() + 5 * 60 * 1000 
      });

      await OTPController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Invalid OTP!' });

    });

  });

});
