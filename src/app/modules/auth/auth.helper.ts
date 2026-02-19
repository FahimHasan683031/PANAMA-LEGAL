import { Secret } from 'jsonwebtoken'
import { jwtHelper } from '../../../helpers/jwtHelper'
import config from '../../../config'
import { Types } from 'mongoose'
import bcrypt from "bcrypt";
import { IAuthResponse } from './auth.interface';




const createToken = (authId: Types.ObjectId, role: string, fullName?: string, email?: string, fcmToken?: string) => {
  const accessToken = jwtHelper.createToken(
    { authId, role, fullName, email, fcmToken },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  )
  const refreshToken = jwtHelper.createToken(
    { authId, role, fullName, email, fcmToken },
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as string,
  )

  return { accessToken, refreshToken }
}

const tempAccessToken = (authId: Types.ObjectId, role: string, fullName?: string, email?: string, fcmToken?: string) => {
  const accessToken = jwtHelper.createToken(
    { authId, role, fullName, email, fcmToken },
    'asjdhashd#$uaas98',
    config.jwt.jwt_expire_in as string,
  )

  return { accessToken }
}


const isPasswordMatched = async (
  plainTextPassword: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(plainTextPassword, hashedPassword)
}

export const authResponse = (
  status: number,
  message: string,
  role?: string,
  accessToken?: string,
  refreshToken?: string,
  token?: string,
  userInfo?: IAuthResponse['userInfo'],
): IAuthResponse => {
  return {
    status,
    message,
    ...(role && { role }),
    ...(accessToken && { accessToken }),
    ...(refreshToken && { refreshToken }),
    ...(token && { token }),
    ...(userInfo && { userInfo }),
  }
}

export const AuthHelper = { createToken, isPasswordMatched, authResponse }

