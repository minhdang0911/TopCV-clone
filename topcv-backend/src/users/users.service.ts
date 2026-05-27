import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Role } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }

 async create(data: {
  email: string
  passwordHash?: string
  role: Role
  phone?: string
  provider?: string
  isVerified?: boolean
}) {
  return this.prisma.user.create({ data })
}

  async updateVerified(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
    })
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    })
  }

  async createProfile(userId: string, fullName: string, role: Role) {
  if (role === Role.CANDIDATE) {
    return this.prisma.candidateProfile.create({
      data: { userId, fullName }
    })
  }
  if (role === Role.EMPLOYER) {
    return this.prisma.employerProfile.create({
      data: { userId, companyName: fullName }
    })
  }
}
 async updateEmployerProfile(userId: string, data: {
  companyName?: string
  companySize?: string
  industry?: string
  website?: string
  address?: string
  logoUrl?: string
}) {
  return this.prisma.employerProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      companyName: data.companyName || '',
      ...data,
    },
  })
}

async getEmployerProfile(userId: string) {
  return this.prisma.employerProfile.findUnique({
    where: { userId },
  })
}

async getCandidateProfile(userId: string) {
  return this.prisma.candidateProfile.findUnique({
    where: { userId },
  })
}


}