import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // ตรวจสอบว่าเป็นหน้า admin (ยกเว้นหน้า login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // ตรวจสอบ session จาก cookie หรือ header
    const sessionId = request.cookies.get('adminSessionId')?.value;
    
    if (!sessionId) {
      // ถ้าไม่มี session ให้ redirect ไปหน้า login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};