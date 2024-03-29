import { NextRequest, NextResponse } from 'next/server'
import jwtDecode, { JwtPayload } from 'jwt-decode'

export function middleware(req: NextRequest) {
	const paths = String(req.page.name).split('/')

	const redirect403 = () => {
		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_UI_URL}/403`)
	}
	//Get current url and refresh cookie
	const token = req.cookies['jwt-auth-cookie']

	//Get role current user
	const roleCurrentUser = token
		? jwtDecode<JwtPayload & { userId: number; role: string; email: string }>(token).role
		: null
	if (roleCurrentUser) {
		switch (paths[1]) {
			case 'dashboard':
			case 'clients':
			case 'employees':
			case 'config-company-info':
			case 'dashboard-jobs':
			case 'skills':
			case 'jobs':
			case 'job-applications':
			case 'job-offer-letters':
				if (roleCurrentUser != 'Admin') {
					return redirect403()
				}
				break
			case 'leaves':
			case 'attendance':
			case 'holidays':
			case 'messages':
			case 'private-dashboard':
				if (roleCurrentUser == 'Client') {
					return redirect403()
				}
				break
			case 'private-dashboard-client':
				if (roleCurrentUser != 'Client') {
					return redirect403()
				}
				break
			case 'contracts':
			case 'salaries':
				if (roleCurrentUser == 'Employee') {
					return redirect403()
				}
				break
		}
		if (paths.includes('projects')) {
			if (
				paths.includes('discussions') ||
				paths.includes('files') ||
				paths.includes('notes')
			) {
				if (roleCurrentUser == 'Client') {
					return redirect403()
				}
			}
		}
	}

	return NextResponse.next()
}
