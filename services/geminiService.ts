
import { GoogleGenAI, Type } from "@google/genai";
import { Schedule, Staff, ShiftType, ShiftInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function autoAssignShifts(staff: Staff[], currentSchedule: Schedule): Promise<Schedule> {
  const prompt = `
    Task: Fill in the empty slots (ShiftType.EMPTY) in the hospital staff schedule.
    Target Department: Emergency Room (ER)
    
    Rules:
    1. Each day MUST have at least one senior staff member (isSenior: true).
    2. No staff member should work more than 2 consecutive shifts (e.g., Morning then Afternoon is okay, but Morning-Afternoon-Night is NOT).
    3. Ensure a minimum of 8 hours rest between shifts (e.g., if someone works NIGHT, they shouldn't work MORNING the next day).
    4. Distribute shifts fairly among available staff.
    5. Valid shift types are: MORNING, AFTERNOON, NIGHT, OFF.
    
    Current Staff: ${JSON.stringify(staff)}
    Current Schedule: ${JSON.stringify(currentSchedule)}

    Return the assignments for EVERY staff member and EVERY day in the requested JSON structure.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "A wrapper for the schedule assignments.",
          properties: {
            staffAssignments: {
              type: Type.ARRAY,
              description: "List of assignments grouped by staff.",
              items: {
                type: Type.OBJECT,
                properties: {
                  staffId: { type: Type.STRING, description: "The ID of the staff member." },
                  days: {
                    type: Type.ARRAY,
                    description: "List of shifts assigned to this staff member by date.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        date: { type: Type.STRING, description: "The date in YYYY-MM-DD format." },
                        type: { 
                          type: Type.STRING, 
                          description: "The assigned shift type.",
                          // Note: Enums are supported in string type
                        },
                        zone: { type: Type.STRING, description: "Assigned hospital zone (optional)." }
                      },
                      required: ["date", "type"]
                    }
                  }
                },
                required: ["staffId", "days"]
              }
            }
          },
          required: ["staffAssignments"]
        }
      }
    });

    const result = JSON.parse(response.text);
    
    // Transform the AI response (Array of objects) back into the Schedule type (Nested Records)
    const newSchedule: Schedule = { ...currentSchedule };
    
    if (result && Array.isArray(result.staffAssignments)) {
      result.staffAssignments.forEach((assignment: any) => {
        const staffId = assignment.staffId;
        if (!newSchedule[staffId]) {
          newSchedule[staffId] = {};
        }
        
        if (Array.isArray(assignment.days)) {
          assignment.days.forEach((dayShift: any) => {
            newSchedule[staffId][dayShift.date] = {
              type: dayShift.type as ShiftType,
              zone: dayShift.zone || "ER Zone"
            };
          });
        }
      });
    }

    return newSchedule;
  } catch (error) {
    console.error("Gemini Auto-Assign Error:", error);
    // Return original schedule on failure to prevent data loss
    return currentSchedule;
  }
}
