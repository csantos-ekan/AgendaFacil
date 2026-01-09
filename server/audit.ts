import { db } from './db';
import { auditLogs } from '../shared/schema';
import { Request, Response, NextFunction } from 'express';

export interface AuditLogData {
  userId?: number;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resource: string;
  resourceId?: number;
  result: 'success' | 'failure';
  details?: any;
}

export async function logAudit(req: Request, data: AuditLogData) {
  try {
    await db.insert(auditLogs).values({
      timestamp: new Date(),
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      ipAddress: req.ip || req.socket.remoteAddress || '',
      userAgent: req.get('user-agent') || '',
      result: data.result,
      details: data.details,
    });
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}

export function auditMiddleware(resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data: any) {
      const action = req.method === 'GET' ? 'READ' : 
                     req.method === 'POST' ? 'CREATE' :
                     req.method === 'PUT' ? 'UPDATE' : 'DELETE';
      
      logAudit(req, {
        userId: req.userId,
        action,
        resource,
        resourceId: parseInt(req.params.id) || undefined,
        result: res.statusCode < 400 ? 'success' : 'failure',
        details: { method: req.method, path: req.path }
      });
      
      return originalJson(data);
    };
    
    next();
  };
}
