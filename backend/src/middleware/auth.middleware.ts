import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User, IUser } from '../models/User.model';
import { Tenant, ITenant } from '../models/Tenant.model';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: IUser;
  tenant?: ITenant;
}

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Missing token');
    const payload = verifyToken(header.slice(7));
    const user   = await User.findById(payload.userId).lean();
    const tenant = await Tenant.findById(payload.tenantId).lean();
    if (!user || !tenant) throw new UnauthorizedError('Invalid token');
    req.user   = user as unknown as IUser;
    req.tenant = tenant as unknown as ITenant;
    next();
  } catch (err) { next(err); }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    next();
  };
}
