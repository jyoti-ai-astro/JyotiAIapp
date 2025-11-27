/**
 * Numerology Calculator - Main Orchestrator
 * Part B - Section 3: Numerology Engine
 * 
 * Combines all numerology modules
 */

import { calculateLifePathNumber } from './life-path-number'
import {
  calculateExpressionNumber,
  calculateSoulUrgeNumber,
  calculatePersonalityNumber,
} from './name-numerology'
import { calculateDestinyProfile } from './destiny-number'
import { analyzeMobileNumber, type MobileNumberAnalysis } from './mobile-number-analysis'
import { analyzeVehicleNumber, type VehicleNumberAnalysis } from './vehicle-number-analysis'
import { analyzeHouseNumber, type HouseNumberAnalysis } from './house-number-analysis'

export interface NumerologyProfile {
  lifePathNumber: number
  expressionNumber: number
  soulUrgeNumber: number
  personalityNumber: number
  destinyNumber: number
  birthdayNumber: number
  personalYear: number
  personalMonth: number
  personalDay: number
  mobileNumber?: MobileNumberAnalysis
  vehicleNumber?: VehicleNumberAnalysis
  houseNumber?: HouseNumberAnalysis
  compatibility: {
    bestNumbers: number[]
    challengingNumbers: number[]
  }
}

export class NumerologyCalculator {
  /**
   * Calculate complete numerology profile
   */
  calculate(
    fullName: string,
    birthDate: string | Date,
    mobileNumber?: string,
    vehicleNumber?: string,
    houseNumber?: string
  ): NumerologyProfile {
    const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const dateString = typeof birthDate === 'string' ? birthDate : birthDate.toISOString().split('T')[0]
    
    const lifePath = calculateLifePathNumber(dateString)
    const expression = calculateExpressionNumber(fullName)
    const soulUrge = calculateSoulUrgeNumber(fullName)
    const personality = calculatePersonalityNumber(fullName)
    const destinyProfile = calculateDestinyProfile(fullName, dateString)

    const profile: NumerologyProfile = {
      lifePathNumber: lifePath,
      expressionNumber: expression,
      soulUrgeNumber: soulUrge,
      personalityNumber: personality,
      destinyNumber: destinyProfile.destinyNumber,
      birthdayNumber: date.getDate(),
      personalYear: this.calculatePersonalYear(date),
      personalMonth: this.calculatePersonalMonth(date),
      personalDay: this.calculatePersonalDay(date),
      compatibility: destinyProfile.compatibility,
    }

    // Add optional analyses
    if (mobileNumber) {
      try {
        profile.mobileNumber = analyzeMobileNumber(mobileNumber)
      } catch (error) {
        console.warn('Mobile number analysis failed:', error)
      }
    }

    if (vehicleNumber) {
      try {
        profile.vehicleNumber = analyzeVehicleNumber(vehicleNumber)
      } catch (error) {
        console.warn('Vehicle number analysis failed:', error)
      }
    }

    if (houseNumber) {
      try {
        profile.houseNumber = analyzeHouseNumber(houseNumber)
      } catch (error) {
        console.warn('House number analysis failed:', error)
      }
    }

    return profile
  }

  private calculatePersonalYear(birthDate: Date): number {
    const currentYear = new Date().getFullYear()
    const day = birthDate.getDate()
    const month = birthDate.getMonth() + 1
    
    const sum = this.reduceNumber(day) + this.reduceNumber(month) + this.reduceNumber(currentYear)
    return this.reduceNumber(sum)
  }

  private calculatePersonalMonth(birthDate: Date): number {
    const currentMonth = new Date().getMonth() + 1
    const yearNum = this.calculatePersonalYear(birthDate)
    return this.reduceNumber(yearNum + currentMonth)
  }

  private calculatePersonalDay(birthDate: Date): number {
    const currentDay = new Date().getDate()
    const monthNum = this.calculatePersonalMonth(birthDate)
    return this.reduceNumber(monthNum + currentDay)
  }

  private reduceNumber(num: number): number {
    if (num === 11 || num === 22 || num === 33) return num
    while (num > 9) {
      num = num
        .toString()
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit, 10), 0)
    }
    return num
  }
}

