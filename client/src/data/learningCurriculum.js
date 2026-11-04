/**
 * PrepAI Structured Learning Curriculum
 * Subject -> Topic -> Lesson Architecture
 * Includes beginner-friendly concepts, formulas, decision rules, shortcuts, solved examples, hints, explanations, and topic tests.
 * Modules: Quantitative Aptitude, Logical Reasoning, Verbal Ability, DSA & Coding Practice (17 Topics), CS Fundamentals (5 Subjects)
 */

export const CURRICULUM = [
  {
    "subjectId": "quant",
    "subjectName": "Quantitative Aptitude",
    "iconName": "Calculator",
    "description": "Master arithmetic concepts, formulas, shortcuts, and speed techniques for placement exams.",
    "topics": [
      {
        "id": "time-and-distance",
        "title": "Time, Speed & Distance",
        "subject": "Quantitative Aptitude",
        "category": "Quantitative Aptitude",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "Master speed-distance equations, unit conversions, average speed harmonic mean, and relative velocity.",
        "concept": {
          "overview": "Speed is the rate of covering distance per unit time. In company placement rounds (TCS, Infosys, Cognizant, Wipro, Accenture), problems test average speed, trains crossing platforms, and relative speed.",
          "formulas": [
            {
              "name": "Core Speed Formula",
              "formula": "Speed = Distance / Time (D = S × T, T = D / S)",
              "whenToUse": "Whenever two quantities are known and the third is required.",
              "notes": "Always match units (km/h with hours, m/s with seconds)."
            },
            {
              "name": "Unit Conversion",
              "formula": "1 km/h = 5/18 m/s  |  1 m/s = 18/5 km/h",
              "whenToUse": "Converting speed between metric systems (crucial for train lengths in meters).",
              "notes": "Multiply by 5/18 to convert km/h to m/s; multiply by 18/5 for m/s to km/h."
            },
            {
              "name": "Average Speed (Equal Distances)",
              "formula": "Avg Speed = (2 × S1 × S2) / (S1 + S2)",
              "whenToUse": "Round trips or when two equal distance segments are traveled at different speeds.",
              "notes": "Harmonic mean; never use arithmetic average (S1+S2)/2."
            },
            {
              "name": "Relative Speed",
              "formula": "Opposite Directions: S1 + S2  |  Same Direction: |S1 - S2|",
              "whenToUse": "When two objects (trains, cars, runners) move simultaneously.",
              "notes": "Sum speeds when moving towards/away; subtract when moving in same direction."
            }
          ],
          "shortcuts": [
            {
              "title": "Inverted Ratio Rule",
              "tip": "If Distance is constant, Speed and Time are inversely proportional: S1/S2 = T2/T1.",
              "example": "Increasing speed by 25% (5/4) decreases time by 20% (4/5)."
            },
            {
              "title": "Train Length Rule",
              "tip": "Distance when crossing a platform = Length of train + Length of platform. When crossing a pole/person = Length of train only.",
              "example": "Train of 120m crossing a 180m bridge covers 300m total."
            }
          ],
          "solvedExamples": [
            {
              "question": "A train 180m long runs at 72 km/h. In how many seconds will it cross a telegraph post?",
              "stepByStep": [
                "Convert speed to m/s: 72 × (5/18) = 20 m/s.",
                "Distance to cross post = length of train = 180m.",
                "Time = Distance / Speed = 180 / 20 = 9 seconds."
              ],
              "answer": "9 seconds"
            },
            {
              "question": "A car travels from A to B at 60 km/h and returns at 40 km/h. Find average speed for the full trip.",
              "stepByStep": [
                "Distance is identical in both directions.",
                "Avg Speed = (2 × 60 × 40) / (60 + 40) = 4800 / 100 = 48 km/h."
              ],
              "answer": "48 km/h"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "tsd-p1",
            "question": "A train 150m long takes 20s to cross a platform 250m long. What is the train speed in km/h?",
            "options": [
              "54 km/h",
              "72 km/h",
              "60 km/h",
              "90 km/h"
            ],
            "correctIndex": 1,
            "hint": "Total distance = 150 + 250 = 400m. Convert speed m/s to km/h using 18/5.",
            "explanation": "Speed = 400m / 20s = 20 m/s. 20 × (18/5) = 72 km/h."
          },
          {
            "id": "tsd-p2",
            "question": "Two cars move towards each other from points 200 km apart at 40 km/h and 60 km/h. When do they meet?",
            "options": [
              "1.5 hours",
              "2 hours",
              "2.5 hours",
              "3 hours"
            ],
            "correctIndex": 1,
            "hint": "Relative speed in opposite directions is the sum of both speeds.",
            "explanation": "Relative speed = 40 + 60 = 100 km/h. Time = 200 / 100 = 2 hours."
          }
        ],
        "topicTest": [
          {
            "id": "tsd-t1",
            "question": "If a person walks at 14 km/h instead of 10 km/h, he walks 20 km more in the same time. Find the actual distance traveled.",
            "options": [
              "50 km",
              "60 km",
              "70 km",
              "80 km"
            ],
            "correctIndex": 0,
            "explanation": "Let actual distance be D. D/10 = (D+20)/14 => 14D = 10D + 200 => 4D = 200 => D = 50 km."
          },
          {
            "id": "tsd-t2",
            "question": "A thief is spotted by a policeman from 200m away. If thief runs at 10 km/h and policeman at 11 km/h, how far will the thief have run before being overtaken?",
            "options": [
              "1 km",
              "1.5 km",
              "2 km",
              "2.5 km"
            ],
            "correctIndex": 2,
            "explanation": "Relative speed = 1 km/h = 5/18 m/s. Time to catch = 200 / (5/18) = 720 seconds = 12 mins. Distance by thief = 10 × (12/60) = 2 km."
          }
        ]
      },
      {
        "id": "time-and-work",
        "title": "Time & Work",
        "subject": "Quantitative Aptitude",
        "category": "Quantitative Aptitude",
        "badge": "Placement Classic",
        "estimatedTime": "25 mins",
        "summary": "Unitary work efficiency, negative work in pipes and cisterns, and the Man-Days-Hours equivalence theorem.",
        "concept": {
          "overview": "Time and Work questions quantify productivity rate per day or hour. If a person completes a job in N days, their 1-day work rate is 1/N. Work done = Rate × Time.",
          "formulas": [
            {
              "name": "Combined Work Rate",
              "formula": "1/T_total = 1/A + 1/B  =>  T = (A × B) / (A + B)",
              "whenToUse": "When two individuals work simultaneously on the same task.",
              "notes": "For 3 workers: 1/T = 1/A + 1/B + 1/C."
            },
            {
              "name": "Man-Days Equivalence (MDH Rule)",
              "formula": "(M1 × D1 × H1) / W1 = (M2 × D2 × H2) / W2",
              "whenToUse": "When team size, days, daily hours, or workload variations are compared.",
              "notes": "W represents amount of work; if identical, W1 = W2 = 1."
            },
            {
              "name": "Pipes and Cisterns",
              "formula": "Net rate = (1/Inlet_A + 1/Inlet_B) - 1/Outlet_C",
              "whenToUse": "Inflow pipes fill tank (positive rate); drain pipes empty it (negative rate).",
              "notes": "If net rate is negative, tank will empty over time."
            }
          ],
          "shortcuts": [
            {
              "title": "LCM Efficiency Method",
              "tip": "Assume total work = LCM of days. Calculate individual units per day instead of working with fractions.",
              "example": "A takes 10 days, B takes 15 days. Let total work = 30 units. A does 3 u/day, B does 2 u/day. Combined = 5 u/day. Time = 30/5 = 6 days."
            }
          ],
          "solvedExamples": [
            {
              "question": "A can do a piece of work in 12 days and B in 24 days. Working together, in how many days will they finish?",
              "stepByStep": [
                "Total work = LCM(12, 24) = 24 units.",
                "A efficiency = 24/12 = 2 units/day. B efficiency = 24/24 = 1 unit/day.",
                "Combined efficiency = 2 + 1 = 3 units/day.",
                "Days required = 24 / 3 = 8 days."
              ],
              "answer": "8 days"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "tw-p1",
            "question": "Pipe A can fill a tank in 6 hours and Pipe B can empty it in 8 hours. If both are open, how long to fill the tank?",
            "options": [
              "12 hours",
              "18 hours",
              "24 hours",
              "30 hours"
            ],
            "correctIndex": 2,
            "hint": "Inlet is positive work; outlet is negative work. Net rate = 1/6 - 1/8.",
            "explanation": "Net rate = (4 - 3)/24 = 1/24 per hour. Time = 24 hours."
          }
        ],
        "topicTest": [
          {
            "id": "tw-t1",
            "question": "15 men can complete a project in 20 days. How many days will 25 men take to complete the same work?",
            "options": [
              "10 days",
              "12 days",
              "14 days",
              "16 days"
            ],
            "correctIndex": 1,
            "explanation": "M1 × D1 = M2 × D2 => 15 × 20 = 25 × D2 => 300 = 25 × D2 => D2 = 12 days."
          }
        ]
      },
      {
        "id": "profit-and-loss",
        "title": "Profit, Loss & Discount",
        "subject": "Quantitative Aptitude",
        "category": "Quantitative Aptitude",
        "badge": "High Frequency",
        "estimatedTime": "20 mins",
        "summary": "Master Cost Price (CP), Selling Price (SP), Marked Price (MP), successive discounts, and false weight margins.",
        "concept": {
          "overview": "Profit or loss is always calculated on the Cost Price (CP) unless specifically stated otherwise. Discounts are always calculated on the Marked Price (MP).",
          "formulas": [
            {
              "name": "Profit and Loss Percentage",
              "formula": "Profit% = (SP - CP)/CP × 100  |  Loss% = (CP - SP)/CP × 100",
              "whenToUse": "Basic transactional calculations.",
              "notes": "SP > CP is profit; SP < CP is loss."
            },
            {
              "name": "Selling Price from CP and Margin",
              "formula": "SP = CP × (100 + P%)/100  or  CP × (100 - L%)/100",
              "whenToUse": "Direct single-step calculation of SP.",
              "notes": "Multiplier: 20% profit = 1.2 × CP."
            },
            {
              "name": "Successive Discounts",
              "formula": "Equivalent Discount = (D1 + D2 - (D1 × D2)/100)%",
              "whenToUse": "When two consecutive discounts are applied to marked price.",
              "notes": "Discounts of 20% and 10% yield 20 + 10 - 2 = 28% total discount."
            }
          ],
          "shortcuts": [
            {
              "title": "Dishonest Shopkeeper Multiplier",
              "tip": "Profit% = (Error / (True Value - Error)) × 100 when selling at CP using false weight.",
              "example": "Using 900g instead of 1000g: Profit = (100 / 900) × 100 = 11.11%."
            }
          ],
          "solvedExamples": [
            {
              "question": "An item marked at $800 is sold at two successive discounts of 10% and 20%. What is the selling price?",
              "stepByStep": [
                "Equivalent discount = 10 + 20 - (10×20)/100 = 28%.",
                "SP = 800 × (100 - 28)/100 = 800 × 0.72 = $576."
              ],
              "answer": "$576"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "pl-p1",
            "question": "By selling an article for $450, a merchant loses 10%. At what price should he sell it to gain 20%?",
            "options": [
              "$500",
              "$550",
              "$600",
              "$650"
            ],
            "correctIndex": 2,
            "hint": "First find CP: 450 = 0.90 × CP => CP = 500. Then target 20% profit on 500.",
            "explanation": "CP = 450 / 0.9 = 500. Required SP = 500 × 1.20 = $600."
          }
        ],
        "topicTest": [
          {
            "id": "pl-t1",
            "question": "A dealer marks goods 30% above cost and allows a 15% discount. What is his profit percentage?",
            "options": [
              "10.5%",
              "12%",
              "14.5%",
              "15%"
            ],
            "correctIndex": 0,
            "explanation": "Let CP = 100. MP = 130. SP = 130 × 0.85 = 110.5. Profit% = 10.5%."
          }
        ]
      },
      {
        "id": "percentages-and-ratios",
        "title": "Percentages, Ratios & Proportions",
        "subject": "Quantitative Aptitude",
        "category": "Quantitative Aptitude",
        "badge": "Foundation",
        "estimatedTime": "20 mins",
        "summary": "Fraction-to-percentage conversions, compounding changes, ratio compounding, and alligation mixture rules.",
        "concept": {
          "overview": "Percentages and Ratios form the mathematical foundation for Data Interpretation, Profit & Loss, and Mixture problems in placement tests.",
          "formulas": [
            {
              "name": "Percentage Change",
              "formula": "Change% = ((Final - Initial) / Initial) × 100",
              "whenToUse": "Growth and reduction analysis.",
              "notes": "Always divide by the original baseline value."
            },
            {
              "name": "Compounded Ratio",
              "formula": "Compounded ratio of (a:b) and (c:d) = (a×c : b×d)",
              "whenToUse": "Combining multiple proportional relations.",
              "notes": "If A:B = 2:3 and B:C = 4:5, multiply to align common term B."
            }
          ],
          "shortcuts": [
            {
              "title": "AB-Product Invariance Rule",
              "tip": "If A × B = Constant, and A increases by x/(x+y), B decreases by x/(x+y) equivalent.",
              "example": "If price increases by 25% (1/4), consumption must decrease by 1/5 (20%) to keep budget constant."
            }
          ],
          "solvedExamples": [
            {
              "question": "If A:B = 2:3 and B:C = 4:5, find the combined ratio A:B:C.",
              "stepByStep": [
                "Make B common: multiply A:B by 4 -> 8:12.",
                "Multiply B:C by 3 -> 12:15.",
                "Combined ratio A:B:C = 8:12:15."
              ],
              "answer": "8:12:15"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "pr-p1",
            "question": "If the price of sugar rises by 20%, by what percent must a household reduce consumption to keep expenditure the same?",
            "options": [
              "16.67%",
              "20%",
              "25%",
              "15%"
            ],
            "correctIndex": 0,
            "hint": "Decrease = (20 / (100 + 20)) × 100.",
            "explanation": "(20 / 120) × 100 = 1/6 × 100 = 16.67%."
          }
        ],
        "topicTest": [
          {
            "id": "pr-t1",
            "question": "Two numbers are in the ratio 3:5. If 9 is subtracted from each, the ratio becomes 12:23. Find the smaller number.",
            "options": [
              "27",
              "33",
              "36",
              "45"
            ],
            "correctIndex": 1,
            "explanation": "(3x - 9)/(5x - 9) = 12/23 => 23(3x - 9) = 12(5x - 9) => 69x - 207 = 60x - 108 => 9x = 99 => x = 11. Smaller = 3 × 11 = 33."
          }
        ]
      },
      {
        "id": "permutations-and-combinations",
        "title": "Permutations & Combinations",
        "subject": "Quantitative Aptitude",
        "category": "Quantitative Aptitude",
        "badge": "Analytical",
        "estimatedTime": "25 mins",
        "summary": "Distinguish arrangements (order matters) from selections (order irrelevant), circular permutations, and anagrams.",
        "concept": {
          "overview": "Permutations count ordered arrangements (nPr = n! / (n-r)!). Combinations count unordered selections (nCr = n! / (r! × (n-r)!)). Fundamental Counting Principle states total ways = m × n.",
          "formulas": [
            {
              "name": "Permutation Formula",
              "formula": "nPr = n! / (n - r)!",
              "whenToUse": "Arranging r items out of n where order matters (rankings, words).",
              "notes": "nPn = n!."
            },
            {
              "name": "Combination Formula",
              "formula": "nCr = n! / (r! × (n - r)!)",
              "whenToUse": "Selecting r items out of n where order does not matter (committees, hands).",
              "notes": "nCr = nC(n-r)."
            },
            {
              "name": "Circular Permutations",
              "formula": "Circular ways = (n - 1)!",
              "whenToUse": "Arranging n distinct items around a round table.",
              "notes": "If necklace/garland (clockwise/anticlockwise indistinguishable), divide by 2: (n-1)! / 2."
            }
          ],
          "shortcuts": [
            {
              "title": "Identical Letters Word Permutations",
              "tip": "Total permutations of a word with repeated letters = n! / (p! × q! × r!).",
              "example": "MISSISSIPPI: 11 letters (1 M, 4 I, 4 S, 2 P) => 11! / (4! × 4! × 2!)."
            }
          ],
          "solvedExamples": [
            {
              "question": "In how many ways can a committee of 3 men and 2 women be chosen from 6 men and 5 women?",
              "stepByStep": [
                "Ways to choose 3 men from 6 = 6C3 = (6×5×4)/(3×2×1) = 20.",
                "Ways to choose 2 women from 5 = 5C2 = (5×4)/(2×1) = 10.",
                "Total independent selections = 20 × 10 = 200."
              ],
              "answer": "200 ways"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "pnc-p1",
            "question": "How many different 4-letter words can be formed using the letters of the word \"LOGARITHM\" without repetition?",
            "options": [
              "3024",
              "1512",
              "5040",
              "2520"
            ],
            "correctIndex": 0,
            "hint": "LOGARITHM has 9 distinct letters. Calculate 9P4.",
            "explanation": "9P4 = 9 × 8 × 7 × 6 = 3024."
          }
        ],
        "topicTest": [
          {
            "id": "pnc-t1",
            "question": "In how many ways can 5 people be seated around a circular banquet table?",
            "options": [
              "120",
              "24",
              "60",
              "48"
            ],
            "correctIndex": 1,
            "explanation": "Circular permutation = (5 - 1)! = 4! = 24."
          }
        ]
      },
      {
        "id": "probability",
        "title": "Probability",
        "subject": "Quantitative Aptitude",
        "category": "Quantitative Aptitude",
        "badge": "Analytical",
        "estimatedTime": "20 mins",
        "summary": "Classical probability, independent vs mutually exclusive events, conditional probability, and deck/dice problems.",
        "concept": {
          "overview": "Probability measures the likelihood of an event occurring: P(E) = Favorable Outcomes / Total Sample Space. 0 <= P(E) <= 1. Complement: P(E) + P(not E) = 1.",
          "formulas": [
            {
              "name": "Classical Probability",
              "formula": "P(A) = n(A) / n(S)",
              "whenToUse": "Equally likely random experiments.",
              "notes": "Sum of all elementary event probabilities equals 1."
            },
            {
              "name": "Addition Rule",
              "formula": "P(A or B) = P(A) + P(B) - P(A and B)",
              "whenToUse": "Finding probability of at least one of two events.",
              "notes": "If mutually exclusive, P(A and B) = 0."
            },
            {
              "name": "Independent Multiplication Rule",
              "formula": "P(A and B) = P(A) × P(B)",
              "whenToUse": "When occurrence of event A does not affect event B.",
              "notes": "E.g., rolling a die and flipping a coin."
            }
          ],
          "shortcuts": [
            {
              "title": "At Least One Shortcut",
              "tip": "P(At least one success) = 1 - P(Zero successes).",
              "example": "Chance of getting at least one head in 3 coin tosses = 1 - (1/2)^3 = 7/8."
            }
          ],
          "solvedExamples": [
            {
              "question": "Two dice are rolled simultaneously. What is the probability that the sum of the numbers is 8?",
              "stepByStep": [
                "Total sample space = 6 × 6 = 36.",
                "Pairs yielding sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes.",
                "Probability = 5 / 36."
              ],
              "answer": "5/36"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "prob-p1",
            "question": "A card is drawn from a standard deck of 52 cards. What is the probability of drawing a face card (Jack, Queen, King)?",
            "options": [
              "3/13",
              "4/13",
              "1/4",
              "1/13"
            ],
            "correctIndex": 0,
            "hint": "There are 4 suits, each containing 3 face cards. Total face cards = 12.",
            "explanation": "P = 12 / 52 = 3 / 13."
          }
        ],
        "topicTest": [
          {
            "id": "prob-t1",
            "question": "A box contains 4 red and 6 blue balls. If two balls are drawn at random without replacement, find the probability that both are red.",
            "options": [
              "2/15",
              "4/15",
              "1/5",
              "1/3"
            ],
            "correctIndex": 0,
            "explanation": "P(1st red) = 4/10. P(2nd red) = 3/9. P = (4/10) × (3/9) = 12/90 = 2/15."
          }
        ]
      },
      {
        "id": "numbers-and-divisibility",
        "title": "Numbers & Divisibility",
        "subject": "Quantitative Aptitude",
        "category": "Quantitative Aptitude",
        "badge": "Core Theory",
        "estimatedTime": "20 mins",
        "summary": "Divisibility rules (2 through 11), HCF/LCM properties, prime factorizations, unit digits, and cyclicity.",
        "concept": {
          "overview": "Number properties test divisibility tests, remainders, modular arithmetic, and HCF × LCM = Product of two numbers.",
          "formulas": [
            {
              "name": "Fundamental HCF-LCM Rule",
              "formula": "Product of two numbers = HCF(a, b) × LCM(a, b)",
              "whenToUse": "When HCF, LCM, and one number are provided.",
              "notes": "Holds strictly for two numbers."
            },
            {
              "name": "Divisibility by 3 and 9",
              "formula": "Sum of digits is divisible by 3 or 9 respectively.",
              "whenToUse": "Quick divisibility check.",
              "notes": "E.g., 513 -> 5+1+3=9 (divisible by 9)."
            },
            {
              "name": "Divisibility by 11",
              "formula": "|Sum(Odd position digits) - Sum(Even position digits)| is 0 or multiple of 11.",
              "whenToUse": "Testing large numbers for 11 divisibility.",
              "notes": "Alternate signs sum."
            }
          ],
          "shortcuts": [
            {
              "title": "Unit Digit Cyclicity of Powers",
              "tip": "Unit digits of 2, 3, 7, 8 repeat in cycles of 4. Unit digits of 4, 9 repeat in cycles of 2. 0, 1, 5, 6 remain constant.",
              "example": "Find unit digit of 7^105: 105 mod 4 = 1. Unit digit = 7^1 = 7."
            }
          ],
          "solvedExamples": [
            {
              "question": "The HCF of two numbers is 11 and their LCM is 7700. If one number is 275, find the other number.",
              "stepByStep": [
                "HCF × LCM = Number1 × Number2.",
                "11 × 7700 = 275 × Number2.",
                "Number2 = (11 × 7700) / 275 = 84700 / 275 = 308."
              ],
              "answer": "308"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "num-p1",
            "question": "What is the remainder when 2^31 is divided by 5?",
            "options": [
              "1",
              "2",
              "3",
              "4"
            ],
            "correctIndex": 2,
            "hint": "Use unit digit cyclicity of 2: 2^1=2, 2^2=4, 2^3=8, 2^4=6 (cycle length 4).",
            "explanation": "31 mod 4 = 3 => unit digit of 2^31 is 8. 8 mod 5 leaves a remainder of 3."
          }
        ],
        "topicTest": [
          {
            "id": "num-t1",
            "question": "Find the largest 4-digit number exactly divisible by 12, 15, 18, and 27.",
            "options": [
              "9720",
              "9810",
              "9900",
              "9640"
            ],
            "correctIndex": 0,
            "explanation": "LCM(12, 15, 18, 27) = 540. Largest 4-digit number is 9999. 9999 / 540 = 18 with remainder 279. 9999 - 279 = 9720."
          }
        ]
      }
    ]
  },
  {
    "subjectId": "logical",
    "subjectName": "Logical Reasoning",
    "iconName": "Brain",
    "description": "Develop analytical thinking, relational deductions, arrangement diagrams, and pattern evaluation.",
    "topics": [
      {
        "id": "number-letter-series",
        "title": "Number & Letter Series",
        "subject": "Logical Reasoning",
        "category": "Logical Reasoning",
        "badge": "High Frequency",
        "estimatedTime": "20 mins",
        "summary": "Identify numerical progressions, geometric multipliers, alternating nested sequences, and alphabet position shifts.",
        "concept": {
          "overview": "Series completion evaluates logical sequence recognition. Common patterns include arithmetic differences, differences of differences, squares/cubes, Fibonacci patterns, and A=1 to Z=26 positioning.",
          "formulas": [
            {
              "name": "Alphabet Letter Numbering (EJOTY Rule)",
              "formula": "E=5, J=10, O=15, T=20, Y=25",
              "whenToUse": "Instantly pinpointing letter index values in alphabet series.",
              "notes": "Reverse letters: Pos(Letter) + Pos(Opposite) = 27."
            }
          ],
          "shortcuts": [
            {
              "title": "Difference of Differences",
              "tip": "If initial differences do not form an arithmetic sequence, calculate the difference between the differences.",
              "example": "Series: 2, 5, 10, 17, 26 -> D1: 3, 5, 7, 9 (D2: constant +2)."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find the missing number in the series: 3, 7, 15, 31, 63, ?",
              "stepByStep": [
                "Pattern: each number is (previous × 2) + 1.",
                "3×2 + 1 = 7; 7×2 + 1 = 15; 15×2 + 1 = 31; 31×2 + 1 = 63.",
                "Next term = 63 × 2 + 1 = 127."
              ],
              "answer": "127"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "nls-p1",
            "question": "Identify the next term in: 4, 9, 25, 49, 121, ?",
            "options": [
              "144",
              "169",
              "196",
              "225"
            ],
            "correctIndex": 1,
            "hint": "Observe the bases: 2^2, 3^2, 5^2, 7^2, 11^2. Notice these are squares of prime numbers.",
            "explanation": "Next prime after 11 is 13. 13^2 = 169."
          }
        ],
        "topicTest": [
          {
            "id": "nls-t1",
            "question": "Find the next term: B, E, I, N, T, ?",
            "options": [
              "Y",
              "Z",
              "A",
              "B"
            ],
            "correctIndex": 2,
            "explanation": "B=2, E=5 (+3), I=9 (+4), N=14 (+5), T=20 (+6). Next difference is +7: 20 + 7 = 27 = 26 + 1 = A."
          }
        ]
      },
      {
        "id": "blood-relations",
        "title": "Blood Relations",
        "subject": "Logical Reasoning",
        "category": "Logical Reasoning",
        "badge": "Placement Classic",
        "estimatedTime": "20 mins",
        "summary": "Decode complex kinship trees, maternal vs paternal lineages, and coded relation expressions (A+B means A is mother of B).",
        "concept": {
          "overview": "Blood relations questions require constructing a family tree representation. Standard conventions: Males marked as [+], Females as [-], couples with horizontal double lines [=], siblings with single horizontal line [-], generations separated vertically.",
          "formulas": [
            {
              "name": "Kinship Lineage Table",
              "formula": "Paternal = Father side  |  Maternal = Mother side",
              "whenToUse": "Differentiating uncles, aunts, and grandparents.",
              "notes": "Father's brother = Paternal Uncle; Mother's brother = Maternal Uncle."
            }
          ],
          "shortcuts": [
            {
              "title": "Back-to-Front Decoding",
              "tip": "In statements like \"He is the son of the only daughter of my father\", start evaluating from \"my father\" backwards.",
              "example": "My father -> only daughter = Myself (if female) or sister -> son = Nephew or son."
            }
          ],
          "solvedExamples": [
            {
              "question": "Pointing to a photograph, a woman says: \"He is the son of my only brother's wife.\" How is the boy related to the woman?",
              "stepByStep": [
                "Break down phrase: \"My only brother's wife\" = Sister-in-law.",
                "\"Son of sister-in-law\" = Son of her brother.",
                "A brother's son is her Nephew."
              ],
              "answer": "Nephew"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "br-p1",
            "question": "A introduces B as the daughter of the only sister of his father. How is B related to A?",
            "options": [
              "Niece",
              "Cousin",
              "Aunt",
              "Sister"
            ],
            "correctIndex": 1,
            "hint": "Father's sister is A's paternal aunt. Daughter of aunt is a cousin.",
            "explanation": "Father's sister = Paternal Aunt. Aunt's daughter = Cousin."
          }
        ],
        "topicTest": [
          {
            "id": "br-t1",
            "question": "If P $ Q means P is father of Q, and P # Q means P is mother of Q, what does A $ B # C signify?",
            "options": [
              "A is grandfather of C",
              "A is uncle of C",
              "A is father of C",
              "A is brother of C"
            ],
            "correctIndex": 0,
            "explanation": "A is father of B, and B is mother of C. Thus A is maternal grandfather of C."
          }
        ]
      },
      {
        "id": "seating-arrangement",
        "title": "Linear & Circular Seating Arrangement",
        "subject": "Logical Reasoning",
        "category": "Logical Reasoning",
        "badge": "Analytical",
        "estimatedTime": "25 mins",
        "summary": "Solve circular tables facing inward/outward, parallel linear rows, and multi-variable positional constraints.",
        "concept": {
          "overview": "Seating arrangements test relative orientation. For circular tables facing the center: moving clockwise is Left, moving counter-clockwise is Right. If facing outwards, the directions invert.",
          "formulas": [
            {
              "name": "Facing Center Orientation",
              "formula": "Clockwise = Right-to-Left (Candidate Left) | Counter-Clockwise = Candidate Right",
              "whenToUse": "Arranging people around a circle facing inward.",
              "notes": "Opposite person in even-numbered circle of N is at position (i + N/2)."
            }
          ],
          "shortcuts": [
            {
              "title": "Definite Clue Anchor Strategy",
              "tip": "Never start with ambiguous clues (e.g. \"A is near B\"). Start strictly with fixed positional anchors (e.g. \"C sits third to the right of D\").",
              "example": "Place D first, count 3 spots counter-clockwise to seat C."
            }
          ],
          "solvedExamples": [
            {
              "question": "Six friends (A, B, C, D, E, F) sit in a circle facing inward. A is opposite D. B is to the immediate right of A. E is opposite B. Who is to the immediate left of D?",
              "stepByStep": [
                "Seat A at top (12 o'clock). D is opposite at 6 o'clock.",
                "A faces inward: immediate right is counter-clockwise (10 o'clock). B is at 10 o'clock.",
                "E is opposite B, so E sits at 4 o'clock.",
                "At D (6 o'clock, facing inward/up), immediate left is clockwise towards 4 o'clock (where E sits)."
              ],
              "answer": "E"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "sa-p1",
            "question": "In a row of 25 students, Rahul is 10th from the left end. What is his position from the right end?",
            "options": [
              "15th",
              "16th",
              "17th",
              "14th"
            ],
            "correctIndex": 1,
            "hint": "Total = Left + Right - 1 => Right = Total - Left + 1.",
            "explanation": "Right = 25 - 10 + 1 = 16th."
          }
        ],
        "topicTest": [
          {
            "id": "sa-t1",
            "question": "Eight people sit around a circular table facing center. How many seats separate any person from the person sitting directly opposite?",
            "options": [
              "2 seats",
              "3 seats",
              "4 seats",
              "1 seat"
            ],
            "correctIndex": 1,
            "explanation": "In a circle of 8, opposite persons have 3 people on their left and 3 people on their right (1 + 3 + 1 + 3 = 8)."
          }
        ]
      },
      {
        "id": "syllogisms",
        "title": "Syllogisms & Venn Logic",
        "subject": "Logical Reasoning",
        "category": "Logical Reasoning",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "Evaluate categorical propositions: All A are B, Some A are B, No A are B, and Either/Or complementary pairs.",
        "concept": {
          "overview": "Syllogisms test deduction strictly from given premises, ignoring real-world facts. Use Venn diagram representations or set logic to verify whether a conclusion definitively follows in all possible diagrams.",
          "formulas": [
            {
              "name": "Standard Venn Enclosures",
              "formula": "All A are B: Circle A inside Circle B | Some A are B: Overlapping Circles | No A are B: Disjoint Circles",
              "whenToUse": "Deducing validity of arguments.",
              "notes": "A conclusion is valid ONLY if it holds in 100% of possible Venn models."
            },
            {
              "name": "Complementary Either-Or Conditions",
              "formula": "1) Same subject & predicate, 2) Both individually invalid, 3) Pair is (Some + No) or (All + Some Not)",
              "whenToUse": "Choosing between individual invalid statements in options.",
              "notes": "All + No is NOT a complementary pair."
            }
          ],
          "shortcuts": [
            {
              "title": "Negative Premise Rule",
              "tip": "If both premises are negative (No/Some Not), NO definitive positive conclusion can ever follow.",
              "example": "No cats are dogs. No dogs are birds. => No conclusion between cats and birds."
            }
          ],
          "solvedExamples": [
            {
              "question": "Statements: All mangoes are fruits. All fruits are sweet. Conclusion 1: All mangoes are sweet. Conclusion 2: Some sweet are mangoes.",
              "stepByStep": [
                "Mangoes circle is completely inside Fruits circle.",
                "Fruits circle is completely inside Sweet circle.",
                "Therefore, Mangoes circle is completely inside Sweet circle (Conclusion 1 follows).",
                "Since Mangoes occupy part of the Sweet circle, Some sweet are mangoes (Conclusion 2 follows)."
              ],
              "answer": "Both conclusions follow"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "syl-p1",
            "question": "Statements: Some books are pens. All pens are pencils. Conclusions: (I) Some pencils are books. (II) All books are pencils.",
            "options": [
              "Only I follows",
              "Only II follows",
              "Both follow",
              "Neither follows"
            ],
            "correctIndex": 0,
            "hint": "Books overlap with pens; all pens are inside pencils. Hence books must overlap with pencils.",
            "explanation": "Only Conclusion I definitely follows. Conclusion II is only a possibility, not guaranteed."
          }
        ],
        "topicTest": [
          {
            "id": "syl-t1",
            "question": "Statements: No bird is a horse. All horses are mammals. Which conclusion must follow?",
            "options": [
              "No bird is a mammal",
              "Some mammals are horses",
              "All mammals are horses",
              "No mammal is a bird"
            ],
            "correctIndex": 1,
            "explanation": "Since all horses are inside mammals, the region occupied by horses guarantees that Some mammals are horses."
          }
        ]
      },
      {
        "id": "coding-decoding",
        "title": "Coding-Decoding",
        "subject": "Logical Reasoning",
        "category": "Logical Reasoning",
        "badge": "Foundation",
        "estimatedTime": "20 mins",
        "summary": "Letter-to-letter shift ciphers, numerical weight coding, matrix substitution, and symbol rearrangement patterns.",
        "concept": {
          "overview": "Coding-decoding evaluates pattern detection across alphabetic transformations. Look for constant forward/backward letter shifts, reverse mirror pairing (A<->Z, B<->Y), and letter position sums.",
          "formulas": [
            {
              "name": "Reverse Alphabet Complement",
              "formula": "Letter Position + Opposite Letter Position = 27",
              "whenToUse": "Mirror ciphers where A=Z, B=Y, C=X, etc.",
              "notes": "E.g., D(4) opposite is 27 - 4 = 23 (W)."
            }
          ],
          "shortcuts": [
            {
              "title": "Cross Pattern Detection",
              "tip": "If direct first-to-first letter mapping does not show a pattern, check if the word is split into halves with crossed shifts.",
              "example": "COLD -> D L O C or +1 cross shift."
            }
          ],
          "solvedExamples": [
            {
              "question": "In a code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that same code?",
              "stepByStep": [
                "Reverse the original word COMPUTER -> R E T U P M O C.",
                "Add +1 to internal letters: E->F, T->U, U->V, P->Q, M->N, O->P.",
                "First and last letters stay unchanged: R ... C.",
                "Apply to MEDICINE: reverse -> E N I C I D E M. Letters become E O J D J E F M."
              ],
              "answer": "EOJDJEFM"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "cd-p1",
            "question": "If CAT is coded as 24 and DOG is coded as 26, how is TIGER coded?",
            "options": [
              "59",
              "60",
              "61",
              "62"
            ],
            "correctIndex": 0,
            "hint": "Sum the 1-based alphabet positions: T=20, I=9, G=7, E=5, R=18.",
            "explanation": "20 + 9 + 7 + 5 + 18 = 59."
          }
        ],
        "topicTest": [
          {
            "id": "cd-t1",
            "question": "If TEACHER is coded as VGCEJGT, what code represents CHILDREN?",
            "options": [
              "EJKNFTGP",
              "EJKNFPGT",
              "EKJNFTGP",
              "EJKNFITP"
            ],
            "correctIndex": 0,
            "explanation": "Each letter is shifted forward by +2: C->E, H->J, I->K, L->N, D->F, R->T, E->G, N->P."
          }
        ]
      },
      {
        "id": "direction-sense",
        "title": "Direction Sense & Displacement",
        "subject": "Logical Reasoning",
        "category": "Logical Reasoning",
        "badge": "Geometric",
        "estimatedTime": "20 mins",
        "summary": "Compass rose coordinates (North, South, East, West), turns and angles, and Pythagorean shortest distance calculation.",
        "concept": {
          "overview": "Direction Sense problems require plotting a path on a Cartesian coordinate plane. Facing North: Right = East, Left = West. Shortest displacement between starting point and endpoint is calculated using the Pythagorean theorem: Distance = sqrt(dx^2 + dy^2).",
          "formulas": [
            {
              "name": "Pythagoras Shortest Distance",
              "formula": "Displacement = sqrt((delta_X)^2 + (delta_Y)^2)",
              "whenToUse": "Finding straight-line aerial distance between origin and final spot.",
              "notes": "Common right triangles: (3, 4, 5), (5, 12, 13), (8, 15, 17)."
            }
          ],
          "shortcuts": [
            {
              "title": "Net Vector Coordinate Method",
              "tip": "Instead of redrawing every turn, track net North-South (+Y/-Y) and net East-West (+X/-X) movements.",
              "example": "Walk 10m North (+10Y), 5m East (+5X), 6m South (-6Y). Net = +4Y, +5X. Distance = sqrt(16 + 25) = sqrt(41)."
            }
          ],
          "solvedExamples": [
            {
              "question": "A man walks 3 km North, turns right and walks 4 km. How far is he from his starting point, and in what direction?",
              "stepByStep": [
                "Vertical leg (North) = 3 km.",
                "Horizontal leg (East) = 4 km.",
                "Shortest distance = sqrt(3^2 + 4^2) = sqrt(9 + 16) = 5 km.",
                "Direction from origin = North-East."
              ],
              "answer": "5 km North-East"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "ds-p1",
            "question": "Sita starts walking West. After walking 20m, she turns left and walks 20m. She then turns left again and walks 20m. In which direction is she now from her initial point?",
            "options": [
              "North",
              "South",
              "East",
              "West"
            ],
            "correctIndex": 1,
            "hint": "Net X: -20 + 20 = 0. Net Y: -20.",
            "explanation": "She moved 20m West, 20m South, and 20m East (cancelling West). She is exactly 20m South of origin."
          }
        ],
        "topicTest": [
          {
            "id": "ds-t1",
            "question": "A person facing South turns 135 degrees anti-clockwise and then 180 degrees clockwise. Which direction is he facing now?",
            "options": [
              "South-West",
              "North-West",
              "South-East",
              "North-East"
            ],
            "correctIndex": 0,
            "explanation": "Net rotation = 180 (clockwise) - 135 (anti-clockwise) = 45 degrees clockwise. From South, 45 degrees clockwise is South-West."
          }
        ]
      },
      {
        "id": "data-sufficiency",
        "title": "Data Sufficiency",
        "subject": "Logical Reasoning",
        "category": "Logical Reasoning",
        "badge": "Advanced Logic",
        "estimatedTime": "25 mins",
        "summary": "Master evaluating whether Statement 1 alone, Statement 2 alone, or both combined are sufficient to solve the problem without doing unnecessary arithmetic.",
        "concept": {
          "overview": "Data Sufficiency tests logical discernment. You do not need the exact numerical answer; you only need to determine if a unique answer CAN be definitively determined from the provided statements.",
          "formulas": [
            {
              "name": "Standard 5-Option Sufficiency Grid",
              "formula": "A: Stmt 1 alone | B: Stmt 2 alone | C: Both together | D: Each alone | E: Neither sufficient",
              "whenToUse": "Elimination hierarchy for all data sufficiency questions.",
              "notes": "Always evaluate Statement 1 and Statement 2 completely independently first."
            }
          ],
          "shortcuts": [
            {
              "title": "The Uniqueness Test",
              "tip": "If a statement yields multiple valid answers (e.g., x^2 = 25 => x = 5 or -5), it is NOT sufficient unless constraints restrict it.",
              "example": "If problem asks \"Is x > 0?\", x=5 or -5 gives both Yes and No, hence insufficient."
            }
          ],
          "solvedExamples": [
            {
              "question": "What is the value of x? Statement 1: 2x + 4 = 14. Statement 2: x^2 = 25.",
              "stepByStep": [
                "Evaluate Stmt 1: 2x = 10 => x = 5. Gives a unique single answer -> Sufficient.",
                "Evaluate Stmt 2: x = 5 or x = -5. Two conflicting values -> Not sufficient.",
                "Conclusion: Statement 1 alone is sufficient."
              ],
              "answer": "Statement 1 alone is sufficient"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "dsuf-p1",
            "question": "Is integer n even? Statement 1: n is divisible by 4. Statement 2: n is divisible by 6.",
            "options": [
              "Statement 1 alone is sufficient",
              "Statement 2 alone is sufficient",
              "Each statement alone is sufficient",
              "Both together are not sufficient"
            ],
            "correctIndex": 2,
            "hint": "Divisibility by any multiple of 2 guarantees the number is even.",
            "explanation": "If n is divisible by 4, it is definitely even. If n is divisible by 6, it is also definitely even. Each statement alone is sufficient."
          }
        ],
        "topicTest": [
          {
            "id": "dsuf-t1",
            "question": "What is the area of rectangle R? Statement 1: The perimeter of R is 30 cm. Statement 2: The diagonal of R is 13 cm.",
            "options": [
              "Statement 1 alone is sufficient",
              "Statement 2 alone is sufficient",
              "Both statements together are sufficient",
              "Statements together are insufficient"
            ],
            "correctIndex": 2,
            "explanation": "From Stmt 1: 2(L + W) = 30 => L + W = 15. From Stmt 2: L^2 + W^2 = 13^2 = 169. Since (L+W)^2 = L^2 + W^2 + 2LW => 225 = 169 + 2LW => 2LW = 56 => Area LW = 28. Both together are sufficient."
          }
        ]
      }
    ]
  },
  {
    "subjectId": "verbal",
    "subjectName": "Verbal Ability",
    "iconName": "BookOpen",
    "description": "Excel in grammatical precision, reading comprehension, contextual vocabulary, and critical reasoning.",
    "topics": [
      {
        "id": "sentence-correction",
        "title": "Sentence Correction & Grammar",
        "subject": "Verbal Ability",
        "category": "Verbal Ability",
        "badge": "High Frequency",
        "estimatedTime": "20 mins",
        "summary": "Subject-verb agreement, modifier placement, parallel structure, pronoun-antecedent agreement, and subjunctive moods.",
        "concept": {
          "overview": "Grammar in corporate assessments (Wipro, Cognizant, TCS verbal) centers on identifying grammatical violations: singular/plural matching, dangling participles, and parallel construction in lists.",
          "formulas": [
            {
              "name": "Subject-Verb Agreement Core",
              "formula": "Singular Subject -> Singular Verb | Plural Subject -> Plural Verb",
              "whenToUse": "When intervening prepositional phrases separate subject and verb.",
              "notes": "Ignore modifying clauses like \"The box of ornaments [is / are]\". The subject is \"box\", so \"is\" is correct."
            }
          ],
          "shortcuts": [
            {
              "title": "Proximity Rule for Correlative Conjunctions",
              "tip": "With \"Neither... nor\" and \"Either... or\", the verb agrees with the subject closest to it.",
              "example": "Neither the manager nor the engineers WERE present. Neither the engineers nor the manager WAS present."
            }
          ],
          "solvedExamples": [
            {
              "question": "Identify the error: \"Each of the participants were given a certificate upon completing the workshop.\"",
              "stepByStep": [
                "Subject is \"Each\", which is an indefinite singular pronoun.",
                "\"of the participants\" is a modifying prepositional phrase.",
                "Singular subject \"Each\" requires singular verb \"was\", not plural \"were\"."
              ],
              "answer": "Replace \"were given\" with \"was given\""
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "sc-p1",
            "question": "Choose the grammatically correct sentence:",
            "options": [
              "One of the keys were lost during the event.",
              "One of the keys was lost during the event.",
              "One of the keys are lost during the event.",
              "One of the keys have been lost during the event."
            ],
            "correctIndex": 1,
            "hint": "The true subject is \"One\", which is singular.",
            "explanation": "The grammatical subject is \"One\" (singular), not \"keys\". The singular verb \"was\" is required."
          }
        ],
        "topicTest": [
          {
            "id": "sc-t1",
            "question": "Select the sentence with correct parallel structure:",
            "options": [
              "She likes cooking, to jog, and reading novels.",
              "She likes cooking, jogging, and reading novels.",
              "She likes to cook, jogging, and reading novels.",
              "She likes cooking, to jog, and to read novels."
            ],
            "correctIndex": 1,
            "explanation": "Parallel structure requires all elements in a series to share the same grammatical form (all gerunds: cooking, jogging, reading)."
          }
        ]
      },
      {
        "id": "reading-comprehension",
        "title": "Reading Comprehension & Inference",
        "subject": "Verbal Ability",
        "category": "Verbal Ability",
        "badge": "Analytical",
        "estimatedTime": "25 mins",
        "summary": "Identify author tone, extract main ideas, deduce logical inferences, and eliminate extreme outlier choices.",
        "concept": {
          "overview": "Reading Comprehension evaluates textual deduction. Key question categories include Central Idea, Explicit Detail, Tone/Attitude (Objective, Critical, Sarcastic, Laudatory), and Inference (must be true based on passage).",
          "formulas": [
            {
              "name": "Inference Definition",
              "formula": "Inference = A conclusion that must strictly be true based on facts stated in the passage",
              "whenToUse": "Differentiating inferences from assumptions or over-generalized extrapolations.",
              "notes": "Never bring external world knowledge into RC answers."
            }
          ],
          "shortcuts": [
            {
              "title": "Extreme Word Elimination",
              "tip": "Options containing extreme qualifiers like \"always\", \"never\", \"only\", \"all\", \"entirely\" are almost always incorrect in RC.",
              "example": "Prefer balanced words: \"tends to\", \"often\", \"in many instances\"."
            }
          ],
          "solvedExamples": [
            {
              "question": "Passage: \"Although artificial intelligence has automated repetitive administrative tasks, human empathy and creative judgment remain irreplaceable in client counseling.\" What is the main idea?",
              "stepByStep": [
                "Passage acknowledges AI productivity in administrative work.",
                "Contrasts it with irreplaceable human skills in counseling.",
                "Central idea: AI complements rather than completely replaces human professionals in judgment-intensive domains."
              ],
              "answer": "AI automates tasks but human qualities remain vital in nuanced roles."
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "rc-p1",
            "question": "If a passage presents statistical findings without offering personal praise or condemnation, the author's tone is best described as:",
            "options": [
              "Critical",
              "Subjective",
              "Objective / Neutral",
              "Sarcastic"
            ],
            "correctIndex": 2,
            "hint": "Focus on whether the author uses emotional adjectives.",
            "explanation": "Factual, data-driven reporting without emotional bias is objective and neutral."
          }
        ],
        "topicTest": [
          {
            "id": "rc-t1",
            "question": "Which of the following choices represents an explicit detail rather than an inference?",
            "options": [
              "A directly stated number or date mentioned in the paragraph",
              "A likely consequence deduced from the final sentence",
              "The presumed motivation of the researcher",
              "The future outlook of the industry"
            ],
            "correctIndex": 0,
            "explanation": "Explicit details are verbatim facts directly stated on the page, requiring no logical leaps."
          }
        ]
      },
      {
        "id": "para-jumbles",
        "title": "Para Jumbles & Sentence Ordering",
        "subject": "Verbal Ability",
        "category": "Verbal Ability",
        "badge": "Placement Classic",
        "estimatedTime": "20 mins",
        "summary": "Sequence scattered sentences logically by finding mandatory pairs, pronoun references, and chronological transitions.",
        "concept": {
          "overview": "Para Jumbles require reassembling shuffled sentences into a coherent paragraph. Look for topic introducers (independent sentences introducing proper nouns), followed by pronouns (he, she, they, this), and concluding summary thoughts.",
          "formulas": [
            {
              "name": "Mandatory Pair Rule",
              "formula": "Find two sentences that MUST occur consecutively (e.g. Noun introduced -> Pronoun referred)",
              "whenToUse": "Eliminating answer choices rapidly.",
              "notes": "If (B, D) is a mandatory pair, eliminate any option where D does not immediately follow B."
            }
          ],
          "shortcuts": [
            {
              "title": "Conjunction Disqualification",
              "tip": "A sentence starting with \"However\", \"Therefore\", \"Moreover\", \"Furthermore\", or \"In contrast\" can NEVER be the opening sentence.",
              "example": "The opening sentence must be an independent noun/theme introduction."
            }
          ],
          "solvedExamples": [
            {
              "question": "Order the sentences: A) He formulated the theory of general relativity. B) Albert Einstein was a theoretical physicist. C) This revolutionized our modern understanding of gravity.",
              "stepByStep": [
                "Sentence B introduces the subject by name: Albert Einstein (Opening sentence).",
                "Sentence A uses the pronoun \"He\" and mentions general relativity.",
                "Sentence C references \"This\" referring back to the theory of general relativity.",
                "Coherent order: B -> A -> C."
              ],
              "answer": "BAC"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "pj-p1",
            "question": "Which sentence is most likely to be the opening sentence of a paragraph?",
            "options": [
              "However, subsequent experiments refuted this hypothesis.",
              "Renewable energy has emerged as a cornerstone of global climate action.",
              "This finding led scientists to re-examine the core data.",
              "Therefore, stricter regulations were enforced."
            ],
            "correctIndex": 1,
            "hint": "The opening sentence introduces the main topic without referencing previous arguments.",
            "explanation": "Sentence 2 is self-contained and introduces the subject. Sentences 1, 3, and 4 rely on previous context."
          }
        ],
        "topicTest": [
          {
            "id": "pj-t1",
            "question": "In resolving para jumbles, an Acronym (e.g. ISRO) and its Full Form (Indian Space Research Organisation) should appear in which order?",
            "options": [
              "Acronym first, full form later",
              "Full form first, followed by acronym in subsequent sentences",
              "Either order is equally valid",
              "They should never appear in the same paragraph"
            ],
            "correctIndex": 1,
            "explanation": "Standard formal English convention introduces the full term first, followed by its acronym in subsequent references."
          }
        ]
      },
      {
        "id": "vocabulary-synonyms-antonyms",
        "title": "Vocabulary, Synonyms & Antonyms",
        "subject": "Verbal Ability",
        "category": "Verbal Ability",
        "badge": "Foundation",
        "estimatedTime": "20 mins",
        "summary": "Master Latin/Greek root words, contextual tone cues, prefix/suffix meanings, and high-frequency placement words.",
        "concept": {
          "overview": "Placement vocabulary tests contextual deduction. Understanding etymology (roots like \"bene\" = good, \"mal\" = bad, \"chron\" = time, \"omni\" = all) enables decoding unfamiliar words in aptitude tests.",
          "formulas": [
            {
              "name": "Root Word Decomposition",
              "formula": "Prefix (Direction/Polarity) + Root (Core Meaning) + Suffix (Part of Speech)",
              "whenToUse": "Deducing meanings of complex vocabulary.",
              "notes": "E.g., In-cred-ible: In (not) + Cred (believe) + ible (capable of) = Unbelievable."
            }
          ],
          "shortcuts": [
            {
              "title": "Connotation Polarity Matching",
              "tip": "Determine whether the target word has a Positive (+), Negative (-), or Neutral tone. In synonym questions, the correct choice must match polarity.",
              "example": "\"Nefarious\" (-) -> Eliminate positive choices like \"kind\", \"honest\"."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find the synonym of EPHEMERAL: A) Eternal, B) Transient, C) Monumental, D) Prosperous.",
              "stepByStep": [
                "Ephemeral means lasting for a very short duration.",
                "Transient means temporary, fleeting, short-lived.",
                "Eternal is an antonym. Monumental and Prosperous are unrelated."
              ],
              "answer": "Transient"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "voc-p1",
            "question": "Choose the word most opposite in meaning (Antonym) to CANDID:",
            "options": [
              "Frank",
              "Deceitful",
              "Outspoken",
              "Sincere"
            ],
            "correctIndex": 1,
            "hint": "Candid means honest, straightforward, and frank.",
            "explanation": "The opposite of candid (truthful/frank) is deceitful (dishonest/evasive)."
          }
        ],
        "topicTest": [
          {
            "id": "voc-t1",
            "question": "What does the root word \"CHRON\" mean in words like chronology, chronic, and synchronous?",
            "options": [
              "Color",
              "Time",
              "Sound",
              "Earth"
            ],
            "correctIndex": 1,
            "explanation": "The Greek root \"chron\" means time (e.g., chronology = arrangement of events in order of time)."
          }
        ]
      },
      {
        "id": "critical-reasoning",
        "title": "Critical Reasoning & Arguments",
        "subject": "Verbal Ability",
        "category": "Verbal Ability",
        "badge": "Analytical",
        "estimatedTime": "25 mins",
        "summary": "Deconstruct arguments into Premise + Assumption = Conclusion. Learn how to strengthen, weaken, or identify logical flaws.",
        "concept": {
          "overview": "Critical reasoning evaluates analytical logic. An argument consists of explicit Premises (evidence), an unstated Assumption (hidden bridge), and a Conclusion (claim). Questions ask to Strengthen, Weaken, or identify the unstated Assumption.",
          "formulas": [
            {
              "name": "Argument Structure Equation",
              "formula": "Premise (Evidence) + Assumption (Unstated Belief) = Conclusion (Claim)",
              "whenToUse": "Breaking down any critical reasoning passage.",
              "notes": "The assumption must be true for the conclusion to hold."
            }
          ],
          "shortcuts": [
            {
              "title": "The Negation Test for Assumptions",
              "tip": "Negate the candidate choice. If negating the statement shatters the author's conclusion, that choice is definitely the required assumption.",
              "example": "Conclusion: \"X caused Y\". Negated assumption: \"Something other than X caused Y\". Shatters conclusion."
            }
          ],
          "solvedExamples": [
            {
              "question": "Argument: \"Electric cars produce zero tailpipe emissions. Therefore, switching all vehicles to electric cars will completely eliminate automotive contribution to global warming.\" Identify the critical flaw.",
              "stepByStep": [
                "Premise: Electric cars produce no tailpipe emissions.",
                "Conclusion: Automotive contribution to global warming will be completely eliminated.",
                "Flaw: Assumes electricity generation to charge cars is 100% emission-free (ignoring coal/gas power plants)."
              ],
              "answer": "Fails to consider emissions generated during electricity production for charging."
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "cr-p1",
            "question": "Which of the following would most WEAKEN an argument claiming that coffee consumption directly increases employee productivity?",
            "options": [
              "A study showing that employees who drink coffee also take more breaks",
              "Evidence that productive employees naturally drink more coffee due to longer work hours",
              "Research indicating that tea contains less caffeine than coffee",
              "Data demonstrating that company coffee machines are expensive to maintain"
            ],
            "correctIndex": 1,
            "hint": "Reverse causality: does coffee cause productivity, or does working long hours cause coffee drinking?",
            "explanation": "Choice 2 establishes reverse causality, directly undermining the claim that coffee is the root cause of productivity."
          }
        ],
        "topicTest": [
          {
            "id": "cr-t1",
            "question": "In critical reasoning, what is an \"assumption\"?",
            "options": [
              "An explicitly stated piece of supporting statistical evidence",
              "The author's final recommendation or opinion",
              "An unstated premise required for the conclusion to be valid",
              "A counter-argument raised by opponents"
            ],
            "correctIndex": 2,
            "explanation": "An assumption is an unstated, implicit premise that the author must believe to be true for their conclusion to hold."
          }
        ]
      }
    ]
  },
  {
    "subjectId": "dsa",
    "subjectName": "DSA & Coding Practice",
    "iconName": "Code2",
    "description": "Master all 17 core coding algorithms, two-pointers, sliding window, trees, heaps, graphs, and dynamic programming.",
    "topics": [
      {
        "id": "dsa-arrays",
        "title": "Arrays & Two-Pointers",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "30 mins",
        "summary": "Contiguous memory layout, two-pointer inward/outward traversal, Dutch National Flag partition, and Kadane's algorithm.",
        "concept": {
          "overview": "Arrays store elements in contiguous memory locations, providing O(1) random access by index. Two-pointer techniques optimize nested searches from O(N^2) to O(N) by traversing sorted arrays inward or outward.",
          "formulas": [
            {
              "name": "Sorted Two-Sum Inward Traversal",
              "formula": "left = 0, right = n - 1; sum < target ? left++ : right--",
              "whenToUse": "Finding pair with given sum in sorted array in O(N) time and O(1) space.",
              "notes": "Avoids hash map memory overhead."
            },
            {
              "name": "Kadane's Maximum Subarray Sum",
              "formula": "current_sum = max(nums[i], current_sum + nums[i]); max_so_far = max(max_so_far, current_sum)",
              "whenToUse": "Finding contiguous subarray with highest sum in O(N) time.",
              "notes": "Resets when current_sum drops below nums[i]."
            }
          ],
          "shortcuts": [
            {
              "title": "Prefix Sum Query Invariant",
              "tip": "Precompute prefix[i] = sum(nums[0..i]). Subarray sum nums[L..R] = prefix[R] - prefix[L-1] in O(1) time.",
              "example": "Answer range sum queries in O(1) after O(N) precomputation."
            }
          ],
          "solvedExamples": [
            {
              "question": "Given sorted array [2, 7, 11, 15] and target 9, find the 1-based indices of two numbers that add up to 9.",
              "stepByStep": [
                "left = 0 (2), right = 3 (15). Sum = 17 > 9 => decrement right to 2.",
                "left = 0 (2), right = 2 (11). Sum = 13 > 9 => decrement right to 1.",
                "left = 0 (2), right = 1 (7). Sum = 9 == target => Match found.",
                "1-based indices: 1 and 2."
              ],
              "answer": "[1, 2]"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "arr-p1",
            "question": "What is the time complexity of finding the maximum subarray sum using Kadane's algorithm on an array of size N?",
            "options": [
              "O(N)",
              "O(N log N)",
              "O(N^2)",
              "O(1)"
            ],
            "correctIndex": 0,
            "hint": "The algorithm iterates through the array exactly once.",
            "explanation": "Kadane's algorithm operates in a single pass O(N) time with O(1) auxiliary space."
          }
        ],
        "topicTest": [
          {
            "id": "arr-t1",
            "question": "In the Dutch National Flag algorithm (sort 0s, 1s, and 2s in-place), what are the roles of the 3 pointers?",
            "options": [
              "low for 0 boundary, mid for current element, high for 2 boundary",
              "left for odd, right for even, mid for zero",
              "start for negative, end for positive, mid for zero",
              "three pointers are not required"
            ],
            "correctIndex": 0,
            "explanation": "Dijkstra's DNF algorithm maintains: nums[0..low-1]=0, nums[low..mid-1]=1, and nums[high+1..n-1]=2."
          }
        ]
      },
      {
        "id": "dsa-strings",
        "title": "Strings & Substrings",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "String immutability, sliding window substrings, KMP prefix function, and palindrome checks.",
        "concept": {
          "overview": "Strings are sequences of characters. In languages like Java and Python, strings are immutable, meaning concatenations create new objects. Interview classics include anagrams, palindromes, and sliding window string searches.",
          "formulas": [
            {
              "name": "Sliding Window Frequency Invariant",
              "formula": "expand right pointer; update counts; while(invalid) { shrink left pointer }",
              "whenToUse": "Finding longest or shortest substring meeting character constraints.",
              "notes": "Runs in O(N) as each character is visited at most twice."
            }
          ],
          "shortcuts": [
            {
              "title": "Array as Hash Table for ASCII",
              "tip": "Use int freq[26] or int freq[128] instead of HashMap for constant-time character frequency counting.",
              "example": "freq[c - \"a\"]++ gives instant O(1) lookups with zero allocation."
            }
          ],
          "solvedExamples": [
            {
              "question": "Determine if \"anagram\" and \"nagaram\" are valid anagrams.",
              "stepByStep": [
                "Lengths match (7 == 7).",
                "Count character frequencies for \"anagram\" into array of size 26.",
                "Decrement frequencies for \"nagaram\".",
                "Verify all 26 buckets equal 0."
              ],
              "answer": "true (Valid anagram)"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "str-p1",
            "question": "What is the time complexity of checking if a string of length N is a palindrome using two pointers?",
            "options": [
              "O(N)",
              "O(N^2)",
              "O(log N)",
              "O(1)"
            ],
            "correctIndex": 0,
            "hint": "One pointer starts at 0, the other at N-1, moving inward until they meet.",
            "explanation": "Pointers compare characters from ends to center, doing at most N/2 comparisons, which is O(N) time."
          }
        ],
        "topicTest": [
          {
            "id": "str-t1",
            "question": "Why is string concatenation in a loop (str += c) inefficient in Java or Python?",
            "options": [
              "It creates a new string object each time, leading to O(N^2) total copy time",
              "It causes integer overflow",
              "It leads to memory leaks in garbage collector",
              "Strings cannot be concatenated in loops"
            ],
            "correctIndex": 0,
            "explanation": "Because strings are immutable, each concatenation copies all previous characters, turning N operations into O(N^2). Use StringBuilder instead."
          }
        ]
      },
      {
        "id": "dsa-linked-lists",
        "title": "Linked Lists",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "Core Theory",
        "estimatedTime": "25 mins",
        "summary": "Singly and doubly linked lists, Floyd's Tortoise and Hare cycle detection, in-place reversal, and merge sorted lists.",
        "concept": {
          "overview": "Linked Lists store nodes containing data and reference pointers to the next node. Unlike arrays, nodes are non-contiguous in memory, allowing O(1) insertions/deletions given a node reference, but O(N) random access.",
          "formulas": [
            {
              "name": "Floyd's Cycle-Finding Algorithm",
              "formula": "slow = slow.next; fast = fast.next.next; if (slow == fast) cycle exists",
              "whenToUse": "Detecting loops in a linked list without using a hash set.",
              "notes": "To find cycle start: reset slow to head; advance both 1 step until they meet."
            },
            {
              "name": "Iterative List Reversal",
              "formula": "next = curr.next; curr.next = prev; prev = curr; curr = next",
              "whenToUse": "Reversing a singly linked list in-place in O(N) time and O(1) space.",
              "notes": "Return prev as new head."
            }
          ],
          "shortcuts": [
            {
              "title": "Dummy Head Node Sentinel",
              "tip": "Create a dummy head (ListNode dummy = new ListNode(0); dummy.next = head) to avoid edge cases when deleting or inserting at the head.",
              "example": "Simplifies merging two sorted lists: tail.next = l1; tail = tail.next."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find the middle node of linked list 1 -> 2 -> 3 -> 4 -> 5.",
              "stepByStep": [
                "Initialize slow = head (1), fast = head (1).",
                "Step 1: slow moves to 2, fast moves to 3.",
                "Step 2: slow moves to 3, fast moves to 5.",
                "fast.next is null, loop terminates. Slow pointer points to 3 (Middle)."
              ],
              "answer": "Node with value 3"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "ll-p1",
            "question": "What is the auxiliary space complexity of Floyd's cycle detection algorithm?",
            "options": [
              "O(1)",
              "O(N)",
              "O(log N)",
              "O(N^2)"
            ],
            "correctIndex": 0,
            "hint": "It only maintains two pointer variables (slow and fast).",
            "explanation": "Floyd's algorithm requires only two pointer references, achieving O(1) auxiliary space."
          }
        ],
        "topicTest": [
          {
            "id": "ll-t1",
            "question": "When deleting a node in a singly linked list given only a reference to that node (not head), how can it be achieved?",
            "options": [
              "Copy the next node's value into the current node, then delete the next node",
              "It is impossible without the head reference",
              "Traverse backwards to find previous node",
              "Set node = null"
            ],
            "correctIndex": 0,
            "explanation": "Copy next node's val into curr: curr.val = curr.next.val; curr.next = curr.next.next. Runs in O(1) time."
          }
        ]
      },
      {
        "id": "dsa-stacks",
        "title": "Stacks & Monotonic Stacks",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "LIFO principle, balanced parentheses verification, infix-to-postfix evaluation, and Monotonic Stack Next Greater Element.",
        "concept": {
          "overview": "Stacks follow Last-In, First-Out (LIFO). All push, pop, and peek operations take O(1) time. Monotonic Stacks maintain elements in strictly ascending or descending order to solve Next Greater/Smaller Element problems in linear O(N) time.",
          "formulas": [
            {
              "name": "Monotonic Decreasing Stack for Next Greater Element",
              "formula": "while(!stack.isEmpty() && arr[stack.peek()] < arr[i]) { res[stack.pop()] = arr[i]; } stack.push(i);",
              "whenToUse": "Finding the next greater element for each index in an array.",
              "notes": "Each element pushed and popped at most once -> O(N) total time."
            }
          ],
          "shortcuts": [
            {
              "title": "Parentheses Matching Map",
              "tip": "Use a hash map or switch statement matching closing brackets to opening counterparts: if (c == ')' && stack.pop() != '(') return false.",
              "example": "Validates parentheses strings in O(N) time."
            }
          ],
          "solvedExamples": [
            {
              "question": "Verify if the bracket sequence \"{[()]}\" is valid.",
              "stepByStep": [
                "Push \"{\" into stack.",
                "Push \"[\" into stack.",
                "Push \"(\" into stack.",
                "Encounter \")\": pop matching \"(\" from stack -> valid.",
                "Encounter \"]\": pop matching \"[\" from stack -> valid.",
                "Encounter \"}\": pop matching \"{\" from stack -> valid.",
                "Stack is empty at end => string is valid."
              ],
              "answer": "true (Valid sequence)"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "stk-p1",
            "question": "What is the time complexity of evaluating a reverse Polish (postfix) notation expression of length N using a stack?",
            "options": [
              "O(N)",
              "O(N log N)",
              "O(N^2)",
              "O(1)"
            ],
            "correctIndex": 0,
            "hint": "Each token is scanned once and pushed or popped from stack in O(1).",
            "explanation": "Postfix evaluation processes each token once with O(1) stack operations, resulting in O(N) time."
          }
        ],
        "topicTest": [
          {
            "id": "stk-t1",
            "question": "Which data structure is typically used by compilers and operating systems to manage function calls and local variables?",
            "options": [
              "Call Stack",
              "Queue",
              "Binary Heap",
              "Hash Table"
            ],
            "correctIndex": 0,
            "explanation": "The Call Stack (execution stack) stores activation records (stack frames) for active function calls."
          }
        ]
      },
      {
        "id": "dsa-queues",
        "title": "Queues & Deques",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "Core Theory",
        "estimatedTime": "20 mins",
        "summary": "FIFO principle, circular array queues, double-ended queues (Deque), and sliding window maximum.",
        "concept": {
          "overview": "Queues follow First-In, First-Out (FIFO). Enqueue adds to the rear; dequeue removes from the front. Deques (Double-Ended Queues) support insertion and removal at both ends in O(1) time, essential for Sliding Window Maximum.",
          "formulas": [
            {
              "name": "Circular Queue Index Wrapping",
              "formula": "rear = (rear + 1) % capacity  |  front = (front + 1) % capacity",
              "whenToUse": "Implementing a queue using a fixed-size array without shifting elements.",
              "notes": "Prevents false overflow when front moves forward."
            }
          ],
          "shortcuts": [
            {
              "title": "Monotonic Deque for Sliding Window Maximum",
              "tip": "Maintain indices in deque such that corresponding values are monotonically decreasing. Front of deque is always window maximum.",
              "example": "Removes elements smaller than incoming element from back; pops expired indices from front."
            }
          ],
          "solvedExamples": [
            {
              "question": "Implement a Queue using two Stacks (inStack and outStack).",
              "stepByStep": [
                "push(x): push directly onto inStack (O(1)).",
                "pop(): if outStack is empty, pop all elements from inStack and push them onto outStack. Then pop from outStack.",
                "Amortized cost: each element is moved at most once -> O(1) amortized time per operation."
              ],
              "answer": "Queue with O(1) amortized operations"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "q-p1",
            "question": "Which traversal algorithm for trees and graphs fundamentally relies on a Queue?",
            "options": [
              "Breadth-First Search (BFS)",
              "Depth-First Search (DFS)",
              "Inorder Traversal",
              "Topological Sort with DFS"
            ],
            "correctIndex": 0,
            "hint": "Level-order traversal visits nodes layer by layer.",
            "explanation": "BFS explores neighbor nodes level by level using a FIFO Queue."
          }
        ],
        "topicTest": [
          {
            "id": "q-t1",
            "question": "What is the time complexity of finding the maximum element in all sliding windows of size K in an array of size N using a Monotonic Deque?",
            "options": [
              "O(N)",
              "O(N × K)",
              "O(N log K)",
              "O(N^2)"
            ],
            "correctIndex": 0,
            "explanation": "Each element index is pushed to and popped from the deque at most once, achieving linear O(N) time."
          }
        ]
      },
      {
        "id": "dsa-hashing",
        "title": "Hashing & Hash Tables",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "Hash functions, collision resolution (Chaining vs Open Addressing), load factors, and Two-Sum hash patterns.",
        "concept": {
          "overview": "Hash Tables map keys to values using a hash function, providing O(1) average time complexity for insertions, deletions, and lookups. In worst-case collisions, performance degrades to O(N).",
          "formulas": [
            {
              "name": "Load Factor Equation",
              "formula": "alpha = n / k (where n = entries, k = number of buckets)",
              "whenToUse": "Determining when a hash map should rehash/resize.",
              "notes": "Standard threshold is 0.75 in Java HashMap. Rehash doubles bucket array size."
            },
            {
              "name": "Complement Lookup Pattern",
              "formula": "if (map.containsKey(target - nums[i])) return [map.get(target - nums[i]), i]",
              "whenToUse": "Two-Sum problem in O(N) time with O(N) space.",
              "notes": "Eliminates nested loop O(N^2) search."
            }
          ],
          "shortcuts": [
            {
              "title": "Collision Handling Distinction",
              "tip": "Separate Chaining stores collisions in linked lists/red-black trees at each bucket. Open Addressing probes next open slots in the same array (linear probing, quadratic, double hashing).",
              "example": "Java 8+ converts bucket linked lists to red-black trees when length exceeds 8."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find if array [4, 5, 1, 2, 0, 4] contains any duplicate elements in O(N) time.",
              "stepByStep": [
                "Initialize empty HashSet.",
                "Iterate through elements: 4, 5, 1, 2, 0 added to set.",
                "Encounter second 4: set.contains(4) returns true.",
                "Duplicate detected in O(N) time and O(N) space."
              ],
              "answer": "true (Contains duplicate)"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "hash-p1",
            "question": "What is the average-case time complexity of inserting a key-value pair into a well-distributed hash map?",
            "options": [
              "O(1)",
              "O(log N)",
              "O(N)",
              "O(N log N)"
            ],
            "correctIndex": 0,
            "hint": "Hash functions calculate bucket index directly using arithmetic modulus.",
            "explanation": "With a good hash function and low load factor, insertion executes in O(1) average time."
          }
        ],
        "topicTest": [
          {
            "id": "hash-t1",
            "question": "In Java 8, when a bucket in HashMap exceeds 8 nodes and total table capacity is at least 64, what data structure replaces the linked list?",
            "options": [
              "Red-Black Balanced Tree (O(log K) search)",
              "AVL Tree",
              "Array list",
              "B-Tree"
            ],
            "correctIndex": 0,
            "explanation": "Java 8 treeifies collision buckets exceeding 8 nodes into Red-Black Trees, reducing worst-case lookup from O(K) to O(log K)."
          }
        ]
      },
      {
        "id": "dsa-searching",
        "title": "Searching & Binary Search",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "Linear search, binary search on sorted arrays, search in rotated sorted arrays, and binary search on answer spaces.",
        "concept": {
          "overview": "Binary Search repeatedly divides the search space in half, achieving logarithmic O(log N) time. It applies to any monotonically ordered condition, not just explicitly sorted arrays (e.g. Binary Search on Answer / Optimization spaces).",
          "formulas": [
            {
              "name": "Midpoint Overflow Prevention",
              "formula": "mid = left + (right - left) / 2",
              "whenToUse": "Calculating midpoint in binary search without 32-bit signed integer overflow.",
              "notes": "Never write (left + right) / 2 as it overflows if left + right > 2^31 - 1."
            },
            {
              "name": "Binary Search Template",
              "formula": "while(left <= right) { mid = left + (right - left)/2; if(arr[mid] == target) return mid; else if(arr[mid] < target) left = mid + 1; else right = mid - 1; }",
              "whenToUse": "Standard binary search on sorted arrays.",
              "notes": "Return -1 if target not found."
            }
          ],
          "shortcuts": [
            {
              "title": "Rotated Sorted Array Invariant",
              "tip": "At least one half of a rotated sorted array (either [left..mid] or [mid..right]) is ALWAYS normally sorted.",
              "example": "Check if target lies inside the sorted half; if yes, search that half, otherwise search the opposite half."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find the index of target 7 in rotated array [4, 5, 6, 7, 0, 1, 2].",
              "stepByStep": [
                "left = 0 (4), right = 6 (2). mid = 3 (7).",
                "nums[mid] == 7 matches target immediately at index 3."
              ],
              "answer": "Index 3"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "bs-p1",
            "question": "How many comparisons does binary search take in the worst case on a sorted array of 1,000,000 elements?",
            "options": [
              "~20 comparisons",
              "~1,000 comparisons",
              "~500,000 comparisons",
              "~10 comparisons"
            ],
            "correctIndex": 0,
            "hint": "log2(1,000,000) is approximately 20 (since 2^20 = 1,048,576).",
            "explanation": "log2(10^6) is approximately 19.93, requiring at most 20 comparisons in worst-case."
          }
        ],
        "topicTest": [
          {
            "id": "bs-t1",
            "question": "When can \"Binary Search on Answer\" be applied to an optimization problem?",
            "options": [
              "When the feasibility function f(x) is monotonic (if x is possible, all values > x or < x are also possible)",
              "Only when the input array is already sorted",
              "Only when problem involves graph traversal",
              "Only for string anagrams"
            ],
            "correctIndex": 0,
            "explanation": "Binary Search on Answer requires a monotonic boolean predicate f(x) that transitions once from false to true (or vice-versa)."
          }
        ]
      },
      {
        "id": "dsa-sorting",
        "title": "Sorting Algorithms",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "Core Theory",
        "estimatedTime": "30 mins",
        "summary": "Comparison sorts (Merge Sort, Quick Sort, Heap Sort) vs Non-comparison sorts (Counting Sort, Radix Sort), and stability.",
        "concept": {
          "overview": "Sorting arranges elements in order. Comparison-based sorts have a theoretical lower bound of Omega(N log N). Non-comparison sorts (Counting Sort, Radix Sort) can achieve O(N + K) when values fall within bounded integer ranges.",
          "formulas": [
            {
              "name": "Comparison Sort Lower Bound",
              "formula": "Worst-case comparisons >= ceil(log2(N!)) = Omega(N log N)",
              "whenToUse": "Proving why general comparison sorts cannot beat O(N log N).",
              "notes": "Stirling's approximation yields N log N."
            },
            {
              "name": "Quick Sort Partition (Lomuto)",
              "formula": "pivot = arr[high]; i = low - 1; for j in low..high-1: if arr[j] < pivot { i++; swap(arr[i], arr[j]); } swap(arr[i+1], arr[high]);",
              "whenToUse": "In-place partitioning in Quick Sort.",
              "notes": "Average time O(N log N), worst-case O(N^2) if pivot poorly chosen."
            }
          ],
          "shortcuts": [
            {
              "title": "Sorting Algorithm Stability Rule",
              "tip": "A sorting algorithm is STABLE if it preserves the relative order of equal elements. Merge Sort and Insertion Sort are stable. Quick Sort and Heap Sort are UNSTABLE by default.",
              "example": "Essential when sorting multi-attribute data (e.g. sort by name, then by grade)."
            }
          ],
          "solvedExamples": [
            {
              "question": "Explain why Merge Sort is preferred over Quick Sort for sorting Singly Linked Lists.",
              "stepByStep": [
                "Merge Sort accesses data sequentially without needing random indexing.",
                "Linked list nodes can be split in O(1) space using slow/fast pointers.",
                "Merging two sorted lists takes O(1) auxiliary space by rewiring next pointers, unlike arrays which require O(N) auxiliary space."
              ],
              "answer": "Sequential access and O(1) auxiliary space via pointer rewiring."
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "sort-p1",
            "question": "Which of the following sorting algorithms offers guaranteed O(N log N) worst-case time complexity AND stability?",
            "options": [
              "Merge Sort",
              "Quick Sort",
              "Heap Sort",
              "Selection Sort"
            ],
            "correctIndex": 0,
            "hint": "Quick Sort is O(N^2) worst-case; Heap Sort is unstable.",
            "explanation": "Merge Sort guarantees O(N log N) worst-case time and preserves relative order of equal elements (stable)."
          }
        ],
        "topicTest": [
          {
            "id": "sort-t1",
            "question": "What is the auxiliary space complexity of standard in-place Heap Sort on an array?",
            "options": [
              "O(1)",
              "O(N)",
              "O(log N)",
              "O(N log N)"
            ],
            "correctIndex": 0,
            "explanation": "Heap Sort rearranges elements in-place within the array using binary heap indices (2i+1, 2i+2), requiring O(1) space."
          }
        ]
      },
      {
        "id": "dsa-recursion",
        "title": "Recursion & Recurrence Relations",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "Foundation",
        "estimatedTime": "25 mins",
        "summary": "Base cases, recursive call stacks, tree recursion, and solving recurrences via the Master Theorem.",
        "concept": {
          "overview": "Recursion occurs when a function calls itself to solve smaller subproblems of the same type. Every valid recursive function requires: 1) A Base Case that terminates execution, and 2) A Recursive Step that progresses toward the base case.",
          "formulas": [
            {
              "name": "Master Theorem for Divide-and-Conquer",
              "formula": "T(N) = a T(N/b) + O(N^d). Compare log_b(a) with d.",
              "whenToUse": "Solving recurrence relations in divide-and-conquer algorithms.",
              "notes": "If log_b(a) > d => T(N) = O(N^(log_b a)). If equal => O(N^d log N). If less => O(N^d)."
            }
          ],
          "shortcuts": [
            {
              "title": "Call Stack Overflow Guard",
              "tip": "Every recursive call consumes a stack frame on the call stack. Deep recursion beyond ~10,000 frames causes StackOverflowError. Convert to iterative with an explicit Stack if recursion depth is large.",
              "example": "Tree height = stack space depth."
            }
          ],
          "solvedExamples": [
            {
              "question": "Solve recurrence T(N) = 2T(N/2) + O(N) using Master Theorem.",
              "stepByStep": [
                "a = 2, b = 2, d = 1.",
                "Compute log_b(a) = log_2(2) = 1.",
                "Compare: log_b(a) == d (1 == 1).",
                "By Case 2 of Master Theorem: T(N) = O(N^d log N) = O(N log N)."
              ],
              "answer": "O(N log N) (Merge Sort recurrence)"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "rec-p1",
            "question": "What happens if a recursive function does not define a base case or never reaches it?",
            "options": [
              "Stack Overflow (memory exhaustion)",
              "Infinite compiler loop",
              "Out of memory on heap",
              "Returns null"
            ],
            "correctIndex": 0,
            "hint": "Call stack frames accumulate indefinitely until process memory limit is exceeded.",
            "explanation": "Without a base case, unbounded recursive calls exhaust thread call stack memory, triggering a StackOverflowError."
          }
        ],
        "topicTest": [
          {
            "id": "rec-t1",
            "question": "What is the space complexity of calculating the Nth Fibonacci number using naive recursion: fib(n) = fib(n-1) + fib(n-2)?",
            "options": [
              "O(N) stack space",
              "O(2^N) space",
              "O(1) space",
              "O(log N) space"
            ],
            "correctIndex": 0,
            "explanation": "Although the time complexity is O(2^N), maximum recursion call stack depth equals the height of the recursion tree, which is O(N)."
          }
        ]
      },
      {
        "id": "dsa-backtracking",
        "title": "Backtracking Algorithms",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "Advanced Logic",
        "estimatedTime": "30 mins",
        "summary": "State-space tree exploration, pruning invalid candidate branches, N-Queens problem, and generating Subsets/Permutations.",
        "concept": {
          "overview": "Backtracking builds solution candidates incrementally and abandons (\"backtracks\") a candidate immediately when it cannot possibly lead to a valid complete solution (pruning). It is systematic depth-first search on state-space trees.",
          "formulas": [
            {
              "name": "Standard Backtracking Paradigm",
              "formula": "void backtrack(state): if (isSolution(state)) { record(); return; } for choice in choices: if (isValid(choice)): makeChoice(); backtrack(state); undoChoice();",
              "whenToUse": "Permutations, combinations, Sudoku solver, N-Queens.",
              "notes": "\"undoChoice()\" restores the state before trying next alternative."
            }
          ],
          "shortcuts": [
            {
              "title": "Pruning with Hash Sets",
              "tip": "In N-Queens, store occupied columns, main diagonals (r - c), and anti-diagonals (r + c) in boolean arrays or sets for O(1) validity checks.",
              "example": "Avoids O(N) scanning of previous rows."
            }
          ],
          "solvedExamples": [
            {
              "question": "How many total solutions exist for the 4-Queens problem on a 4x4 chessboard?",
              "stepByStep": [
                "Place Queen row-by-row.",
                "Row 0: Q at col 1 -> Row 1: Q at col 3 -> Row 2: Q at col 0 -> Row 3: Q at col 2 (Solution 1: [1, 3, 0, 2]).",
                "Row 0: Q at col 2 -> Row 1: Q at col 0 -> Row 2: Q at col 3 -> Row 3: Q at col 1 (Solution 2: [2, 0, 3, 1]).",
                "All other branches get pruned by conflicts."
              ],
              "answer": "2 distinct solutions"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "bt-p1",
            "question": "How many total subsets exist for a set of N distinct elements?",
            "options": [
              "2^N subsets",
              "N! subsets",
              "N^2 subsets",
              "2N subsets"
            ],
            "correctIndex": 0,
            "hint": "For each element, we have 2 binary choices: include or exclude.",
            "explanation": "Each element has 2 possibilities (in or out). By product rule, total subsets = 2^N (the power set)."
          }
        ],
        "topicTest": [
          {
            "id": "bt-t1",
            "question": "What is the primary operational advantage of Backtracking over brute-force exhaustive search?",
            "options": [
              "Pruning eliminates entire subtrees of invalid candidates early without exploring them",
              "It always runs in polynomial time",
              "It eliminates the need for base cases",
              "It uses zero memory"
            ],
            "correctIndex": 0,
            "explanation": "Pruning checks constraints at partial states and abandons dead ends immediately, drastically cutting down search space."
          }
        ]
      },
      {
        "id": "dsa-trees",
        "title": "Trees & Tree Traversals",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "30 mins",
        "summary": "Binary tree anatomy, DFS traversals (Inorder, Preorder, Postorder), BFS level-order, maximum depth, and diameter.",
        "concept": {
          "overview": "A Tree is a hierarchical non-linear data structure with a root node and child subtrees. Binary trees restrict each node to at most two children (left and right). Traversals visit every node in structured order.",
          "formulas": [
            {
              "name": "DFS Traversals Order",
              "formula": "Preorder: Root -> Left -> Right | Inorder: Left -> Root -> Right | Postorder: Left -> Right -> Root",
              "whenToUse": "Inorder gives sorted order for BST; Postorder evaluates bottom-up subtree properties.",
              "notes": "Preorder is useful for serialization/cloning."
            },
            {
              "name": "Maximum Depth of Binary Tree",
              "formula": "height(root) = 1 + max(height(root.left), height(root.right)) (Base: root == null ? 0 : ...)",
              "whenToUse": "Finding longest path from root to leaf in O(N) time.",
              "notes": "Space complexity is O(H) where H is tree height."
            }
          ],
          "shortcuts": [
            {
              "title": "Level-Order Queue Recipe",
              "tip": "Use a Queue for BFS: for(int i=0; i<queue.size(); i++) processes exactly one full depth level per iteration.",
              "example": "Enables grouping nodes level-by-level in O(N) time."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find the Inorder traversal of binary tree with root 1, left child 2, right child 3.",
              "stepByStep": [
                "Inorder visits: Left Subtree -> Root -> Right Subtree.",
                "Visit left child: 2.",
                "Visit root: 1.",
                "Visit right child: 3.",
                "Inorder traversal sequence: [2, 1, 3]."
              ],
              "answer": "[2, 1, 3]"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "tree-p1",
            "question": "What is the maximum number of nodes in a binary tree of height H (where height of single root node = 1)?",
            "options": [
              "2^H - 1",
              "2^(H-1)",
              "2^H",
              "H^2"
            ],
            "correctIndex": 0,
            "hint": "Geometric series: 1 + 2 + 4 + ... + 2^(H-1) = 2^H - 1.",
            "explanation": "A full binary tree has 2^H - 1 nodes (e.g. height 3 has 1 + 2 + 4 = 7 nodes = 2^3 - 1)."
          }
        ],
        "topicTest": [
          {
            "id": "tree-t1",
            "question": "Which tree traversal allows reconstructing a unique binary tree when combined with Inorder traversal?",
            "options": [
              "Either Preorder OR Postorder",
              "Only Level-Order",
              "Neither is sufficient",
              "Only Inorder itself"
            ],
            "correctIndex": 0,
            "explanation": "Inorder provides left-right partitioning; Preorder or Postorder provides root identification. Together they reconstruct the unique binary tree."
          }
        ]
      },
      {
        "id": "dsa-bst",
        "title": "Binary Search Trees (BST)",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "BST ordering invariant (Left < Node < Right), validation, Lowest Common Ancestor (LCA), and balanced self-balancing AVL/Red-Black trees.",
        "concept": {
          "overview": "A Binary Search Tree (BST) maintains the property that for every node: all values in its left subtree are strictly less than node.val, and all values in its right subtree are strictly greater. Inorder traversal of a valid BST always yields sorted order.",
          "formulas": [
            {
              "name": "BST Invariant Range Validation",
              "formula": "boolean isValid(node, min, max): if(node == null) return true; if(node.val <= min || node.val >= max) return false; return isValid(node.left, min, node.val) && isValid(node.right, node.val, max);",
              "whenToUse": "Validating BST property in O(N) time.",
              "notes": "Pass long limits to handle Integer.MIN_VALUE/MAX_VALUE."
            },
            {
              "name": "LCA in BST",
              "formula": "if (p.val < root.val && q.val < root.val) search left; else if (p.val > root.val && q.val > root.val) search right; else return root;",
              "whenToUse": "Finding Lowest Common Ancestor in BST in O(H) time.",
              "notes": "Splitting point is the LCA."
            }
          ],
          "shortcuts": [
            {
              "title": "Inorder Monotonicity Test",
              "tip": "Instead of passing min/max ranges, run an inorder traversal and verify that each visited value is strictly greater than the previous visited value.",
              "example": "Guarantees valid BST in O(N) time with O(H) stack."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find the LCA of nodes 2 and 8 in BST with root 6, left child 2, right child 8.",
              "stepByStep": [
                "Examine root 6.",
                "p=2 < 6, but q=8 > 6.",
                "Since one node lies in left subtree and other in right subtree, 6 is the split point.",
                "LCA is 6."
              ],
              "answer": "Node 6"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "bst-p1",
            "question": "What is the worst-case time complexity of searching in an unbalanced degenerate (skewed) BST of N nodes?",
            "options": [
              "O(N)",
              "O(log N)",
              "O(1)",
              "O(N log N)"
            ],
            "correctIndex": 0,
            "hint": "A skewed BST degenerates into a singly linked list.",
            "explanation": "If elements are inserted in sorted order without balancing, the BST becomes a chain of height N, resulting in O(N) search."
          }
        ],
        "topicTest": [
          {
            "id": "bst-t1",
            "question": "Which traversal of a Binary Search Tree produces elements in strictly ascending sorted order?",
            "options": [
              "Inorder Traversal",
              "Preorder Traversal",
              "Postorder Traversal",
              "Level-order Traversal"
            ],
            "correctIndex": 0,
            "explanation": "Inorder visits Left (smaller) -> Root (middle) -> Right (larger), naturally producing ascending sorted output."
          }
        ]
      },
      {
        "id": "dsa-heaps",
        "title": "Heaps & Priority Queues",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "Binary heaps (Min-heap, Max-heap), O(N) Build-Heap heapify, Top-K frequent elements, and K-way merging.",
        "concept": {
          "overview": "A Binary Heap is a complete binary tree stored compactly in an array. In a Min-Heap, every parent is <= its children (root is absolute minimum). Insert and extract-min operate in O(log N) time, while peek runs in O(1).",
          "formulas": [
            {
              "name": "Array Index Navigation",
              "formula": "Parent(i) = (i - 1) / 2  |  LeftChild(i) = 2i + 1  |  RightChild(i) = 2i + 2",
              "whenToUse": "Accessing parent and children in array representation of a binary heap.",
              "notes": "0-indexed complete binary tree."
            },
            {
              "name": "Top-K Elements Min-Heap Sizing Rule",
              "formula": "Maintain a Min-Heap of fixed size K. If heap.size() > K, heap.poll(). Top-K largest remain in heap.",
              "whenToUse": "Finding K largest elements in stream or array in O(N log K) time.",
              "notes": "Much faster and less memory than sorting array in O(N log N)."
            }
          ],
          "shortcuts": [
            {
              "title": "Linear Build-Heap Property",
              "tip": "Building a heap from an unordered array of size N using bottom-up heapify takes strictly O(N) time, NOT O(N log N).",
              "example": "Most nodes reside near leaves with tiny sift-down paths."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find the 2nd largest element in array [3, 2, 1, 5, 6, 4] using a Min-Heap.",
              "stepByStep": [
                "Maintain Min-Heap of size K = 2.",
                "Add 3, 2 -> heap: [2, 3].",
                "Add 1: heap size 3 -> poll 1 -> heap: [2, 3].",
                "Add 5: poll 2 -> heap: [3, 5].",
                "Add 6: poll 3 -> heap: [5, 6].",
                "Add 4: poll 4 -> heap: [5, 6].",
                "Top of min-heap is 5, which is the 2nd largest element."
              ],
              "answer": "5"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "hp-p1",
            "question": "What is the time complexity to insert an element into a binary heap containing N elements?",
            "options": [
              "O(log N)",
              "O(1)",
              "O(N)",
              "O(N log N)"
            ],
            "correctIndex": 0,
            "hint": "The element is appended at the end and sifted up through the tree height.",
            "explanation": "Sifting up takes time proportional to tree height, which is O(log N)."
          }
        ],
        "topicTest": [
          {
            "id": "hp-t1",
            "question": "What is the time complexity of building a binary heap from an unordered array of N elements using bottom-up heapify?",
            "options": [
              "O(N)",
              "O(N log N)",
              "O(N^2)",
              "O(log N)"
            ],
            "correctIndex": 0,
            "explanation": "Bottom-up heapify runs in O(N) because the mathematical summation of (h / 2^h) converges to a constant."
          }
        ]
      },
      {
        "id": "dsa-graphs",
        "title": "Graphs & Graph Algorithms",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "Placement Classic",
        "estimatedTime": "35 mins",
        "summary": "Adjacency list representation, BFS (shortest unweighted path), DFS (connected components), Dijkstra shortest path, and topological sort.",
        "concept": {
          "overview": "Graphs consist of Vertices (V) and Edges (E). They can be directed or undirected, weighted or unweighted. Common representations are Adjacency Lists (O(V + E) space) and Adjacency Matrices (O(V^2) space).",
          "formulas": [
            {
              "name": "BFS Shortest Path (Unweighted)",
              "formula": "Queue<Integer> q; boolean[] visited; dist[start] = 0; while(!q.isEmpty()) { ... }",
              "whenToUse": "Finding shortest path in unweighted graphs.",
              "notes": "First time a vertex is popped from queue is its minimum distance."
            },
            {
              "name": "Dijkstra Algorithm (Non-negative Weights)",
              "formula": "PriorityQueue<Node> pq; dist[v] = min(dist[v], dist[u] + weight(u, v))",
              "whenToUse": "Shortest path in weighted graph without negative cycles.",
              "notes": "Runs in O((V + E) log V) with binary min-heap."
            },
            {
              "name": "Kahn's Topological Sort (In-Degree BFS)",
              "formula": "Compute inDegree for all vertices; push inDegree==0 to Queue; decrement neighbors",
              "whenToUse": "Course Schedule, dependency resolution in DAGs.",
              "notes": "If processed count < V, graph contains a cycle."
            }
          ],
          "shortcuts": [
            {
              "title": "Bipartite Graph 2-Coloring Rule",
              "tip": "A graph is bipartite (2-colorable) if and only if it contains NO odd-length cycles. Verify using BFS/DFS coloring with 0 and 1.",
              "example": "If a neighbor already has the same color as current vertex, it is not bipartite."
            }
          ],
          "solvedExamples": [
            {
              "question": "Determine if an undirected graph with 3 vertices in a triangle (1-2, 2-3, 3-1) is bipartite.",
              "stepByStep": [
                "Color vertex 1 with RED (0).",
                "Neighbors 2 and 3 must be colored BLUE (1).",
                "Examine edge between 2 and 3: both share color BLUE (1). Conflict!",
                "Triangle is an odd cycle of length 3 => Not bipartite."
              ],
              "answer": "false (Not bipartite)"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "grp-p1",
            "question": "Which algorithm is best suited for finding the shortest path in a weighted graph with negative edge weights (and no negative cycle)?",
            "options": [
              "Bellman-Ford Algorithm",
              "Dijkstra Algorithm",
              "Breadth-First Search",
              "Floyd-Warshall"
            ],
            "correctIndex": 0,
            "hint": "Dijkstra fails with negative weights because greedy assumption is broken.",
            "explanation": "Bellman-Ford relaxes all edges V-1 times, correctly handling negative edge weights in O(V × E) time."
          }
        ],
        "topicTest": [
          {
            "id": "grp-t1",
            "question": "Topological sorting is defined ONLY for which type of graph?",
            "options": [
              "Directed Acyclic Graph (DAG)",
              "Undirected connected graph",
              "Complete graph",
              "Any directed graph including cycles"
            ],
            "correctIndex": 0,
            "explanation": "Topological sort requires a DAG; if a cycle exists, no valid linear dependency ordering is possible."
          }
        ]
      },
      {
        "id": "dsa-greedy",
        "title": "Greedy Algorithms",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "Analytical",
        "estimatedTime": "25 mins",
        "summary": "Greedy choice property, optimal substructure, activity selection, fractional knapsack, and Huffman coding.",
        "concept": {
          "overview": "Greedy algorithms construct solutions by making the locally optimal choice at each step, hoping it leads to a globally optimal solution. A greedy strategy works only when the problem exhibits the Greedy Choice Property and Optimal Substructure.",
          "formulas": [
            {
              "name": "Activity Selection Strategy",
              "formula": "Sort activities by finish time ascending. Pick first, then iteratively pick next activity with start_time >= prev_finish_time.",
              "whenToUse": "Maximizing non-overlapping interval count.",
              "notes": "Runs in O(N log N) sorting + O(N) scanning."
            },
            {
              "name": "Fractional Knapsack Ratio",
              "formula": "Sort items descending by Value-to-Weight ratio (v_i / w_i). Take fractions of the highest ratio item.",
              "whenToUse": "Knapsack where items can be partitioned.",
              "notes": "Does NOT work for 0/1 Knapsack (requires DP)."
            }
          ],
          "shortcuts": [
            {
              "title": "Greedy vs DP Litmus Test",
              "tip": "If choosing an item permanently locks out future combinations that could be better (like 0/1 knapsack where fractions are disallowed), Greedy fails and Dynamic Programming is required.",
              "example": "Coin change with arbitrary denominations requires DP; standard currency (1, 5, 10, 25) works with Greedy."
            }
          ],
          "solvedExamples": [
            {
              "question": "Intervals: [1, 3], [2, 4], [3, 5]. Find maximum number of non-overlapping intervals.",
              "stepByStep": [
                "Already sorted by finish time: [1, 3] (finishes 3), [2, 4] (finishes 4), [3, 5] (finishes 5).",
                "Pick [1, 3]. End time = 3.",
                "[2, 4] start (2) < current end (3) -> overlap, skip.",
                "[3, 5] start (3) >= current end (3) -> compatible, pick [3, 5].",
                "Total selected = 2 intervals."
              ],
              "answer": "2 intervals"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "grd-p1",
            "question": "Why does the greedy approach work for Fractional Knapsack but fail for 0/1 Knapsack?",
            "options": [
              "Fractional knapsack allows taking proportional parts of highest value/weight ratio items without leaving unused capacity gap",
              "0/1 knapsack has no optimal substructure",
              "Fractional knapsack cannot be sorted",
              "Greedy works for both"
            ],
            "correctIndex": 0,
            "hint": "In 0/1 knapsack, taking a high ratio item might prevent taking two items with higher combined total value.",
            "explanation": "Fractions fill remaining capacity completely, guaranteeing optimal greedy choice."
          }
        ],
        "topicTest": [
          {
            "id": "grd-t1",
            "question": "Which minimum spanning tree algorithm greedily adds the cheapest available edge that does not form a cycle?",
            "options": [
              "Kruskal's Algorithm (with Disjoint Set Union)",
              "Prim's Algorithm",
              "Dijkstra's Algorithm",
              "Bellman-Ford"
            ],
            "correctIndex": 0,
            "explanation": "Kruskal's sorts edges by weight ascending and greedily adds edges using DSU to check for cycles."
          }
        ]
      },
      {
        "id": "dsa-dynamic-programming",
        "title": "Dynamic Programming",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "High Frequency",
        "estimatedTime": "35 mins",
        "summary": "Overlapping subproblems, memoization (top-down), tabulation (bottom-up), 0/1 Knapsack, and Longest Common Subsequence (LCS).",
        "concept": {
          "overview": "Dynamic Programming (DP) solves complex problems by breaking them down into simpler subproblems, solving each subproblem once, and storing their solutions (memoization or tabulation) to avoid recalculations.",
          "formulas": [
            {
              "name": "0/1 Knapsack Recurrence",
              "formula": "dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]) (if wt[i-1] <= w)",
              "whenToUse": "Selecting subset of items with maximum value under weight capacity.",
              "notes": "Space can be optimized to 1D array iterating weight backwards."
            },
            {
              "name": "Longest Common Subsequence (LCS)",
              "formula": "if (s1[i-1] == s2[j-1]) dp[i][j] = 1 + dp[i-1][j-1]; else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);",
              "whenToUse": "String similarity, diff tools, edit distance variations.",
              "notes": "Runs in O(M × N) time and O(M × N) space."
            }
          ],
          "shortcuts": [
            {
              "title": "1D State Space Reduction",
              "tip": "If dp[i][j] only depends on the previous row dp[i-1][...], collapse the 2D table into a 1D array of size W to reduce auxiliary space from O(N × W) to O(W).",
              "example": "For 0/1 knapsack, iterate w from capacity down to wt[i] to prevent reusing same item."
            }
          ],
          "solvedExamples": [
            {
              "question": "Find the length of LCS between \"ABCDE\" and \"ACE\".",
              "stepByStep": [
                "Initialize dp table of size 6 x 4.",
                "Matches occur at 'A', 'C', 'E'.",
                "dp accumulates: 1 for 'A', 2 for 'AC', 3 for 'ACE'.",
                "Final LCS length = 3."
              ],
              "answer": "3 (\"ACE\")"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "dp-p1",
            "question": "What are the two essential characteristics required for a problem to be solvable via Dynamic Programming?",
            "options": [
              "Overlapping Subproblems and Optimal Substructure",
              "Greedy Choice and Unsorted Input",
              "Divide-and-Conquer and Disjoint Sets",
              "Recursion without memoization"
            ],
            "correctIndex": 0,
            "hint": "Subproblems must recur repeatedly, and optimal solution must be composable from optimal sub-solutions.",
            "explanation": "DP applies exclusively when subproblems overlap and exhibits optimal substructure."
          }
        ],
        "topicTest": [
          {
            "id": "dp-t1",
            "question": "In bottom-up 1D space-optimized 0/1 Knapsack, why must the inner weight loop run in REVERSE (from capacity W down to weight)?",
            "options": [
              "To ensure each item is used at most once (preventing using the same item in the same step)",
              "To speed up cache locality",
              "It can run in either direction",
              "To sort the items ascending"
            ],
            "correctIndex": 0,
            "explanation": "Iterating backwards ensures dp[w - wt] represents values from the previous item iteration, preventing multiple uses of the same item."
          }
        ]
      },
      {
        "id": "dsa-advanced-ds",
        "title": "Advanced Data Structures (Trie, Segment Tree & DSU)",
        "subject": "DSA & Coding Practice",
        "category": "DSA",
        "badge": "Advanced Logic",
        "estimatedTime": "35 mins",
        "summary": "Trie prefix trees, Disjoint Set Union (DSU / Union-Find with path compression), and Segment Trees for range queries.",
        "concept": {
          "overview": "Advanced data structures solve specialized constraints: Tries optimize prefix and autocomplete queries in O(L) time where L is word length. Disjoint Set Union (DSU) tracks connected components and cycles in near-O(1) time using path compression.",
          "formulas": [
            {
              "name": "Trie Node Structure",
              "formula": "class TrieNode { TrieNode[] children = new TrieNode[26]; boolean isEndOfWord; }",
              "whenToUse": "Prefix matching, dictionary search, autocomplete systems.",
              "notes": "Search/insert time is strictly O(L), independent of total words N."
            },
            {
              "name": "DSU Find with Path Compression",
              "formula": "int find(int i) { if (parent[i] == i) return i; return parent[i] = find(parent[i]); }",
              "whenToUse": "Dynamic connectivity and cycle detection in undirected graphs.",
              "notes": "Path compression flattens the tree, yielding amortized O(alpha(N)) nearly O(1)."
            }
          ],
          "shortcuts": [
            {
              "title": "Union by Rank / Size",
              "tip": "Always attach the smaller tree under the root of the larger tree during union to keep tree height bounded to O(log N). Combined with path compression, it achieves inverse Ackermann O(alpha(N)).",
              "example": "Prevents degenerate tall chains in DSU."
            }
          ],
          "solvedExamples": [
            {
              "question": "Explain why a Trie is faster than a Hash Table for prefix search operations like \"words starting with 'app'\".",
              "stepByStep": [
                "Hash Tables hash complete strings and cannot perform partial prefix lookups without scanning all N keys.",
                "Trie traverses characters 'a' -> 'p' -> 'p' in 3 steps.",
                "The subtree at node 'p' contains all matching words, achieving prefix lookup in O(L) where L is prefix length."
              ],
              "answer": "O(L) prefix lookup versus O(N × L) scan in Hash Table."
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "adv-p1",
            "question": "What is the time complexity of searching for a word of length L in a Trie containing N total words?",
            "options": [
              "O(L)",
              "O(N × L)",
              "O(log N)",
              "O(N)"
            ],
            "correctIndex": 0,
            "hint": "Each character step follows an array index lookup of size 26.",
            "explanation": "Trie operations depend strictly on the length of the string L, not the number of words N in the tree."
          }
        ],
        "topicTest": [
          {
            "id": "adv-t1",
            "question": "What is the time complexity of Segment Tree range sum query and point update on an array of size N?",
            "options": [
              "O(log N) for both query and update",
              "O(1) query and O(N) update",
              "O(N) for both query and update",
              "O(log N) query and O(1) update"
            ],
            "correctIndex": 0,
            "explanation": "Segment Trees divide the array into halves, enabling both range aggregation queries and point updates in O(log N) time."
          }
        ]
      }
    ]
  },
  {
    "subjectId": "cs-fundamentals",
    "subjectName": "CS Fundamentals",
    "iconName": "Layers",
    "description": "Comprehensive placement mastery across OOP, DBMS, SQL, Operating Systems, and Computer Networks.",
    "topics": [
      {
        "id": "cs-oop",
        "title": "Object-Oriented Programming (OOP)",
        "subject": "CS Fundamentals",
        "category": "OOP",
        "badge": "Core Theory",
        "estimatedTime": "30 mins",
        "summary": "The 4 pillars (Encapsulation, Abstraction, Inheritance, Polymorphism), dynamic method dispatch, and SOLID design principles.",
        "concept": {
          "overview": "Object-Oriented Programming organizes software design around data objects rather than functions. Key interview topics include Method Overloading vs Overriding, Abstract Classes vs Interfaces, and SOLID principles.",
          "formulas": [
            {
              "name": "Polymorphism Classification",
              "formula": "Compile-Time: Overloading (Static Binding) | Runtime: Overriding (Dynamic Dispatch via vtable)",
              "whenToUse": "Differentiating parameter resolution from dynamic object resolution.",
              "notes": "Private, static, and final methods cannot be overridden."
            },
            {
              "name": "SOLID Principles Acronym",
              "formula": "S: Single Responsibility | O: Open/Closed | L: Liskov Substitution | I: Interface Segregation | D: Dependency Inversion",
              "whenToUse": "Evaluating architectural design questions in interviews.",
              "notes": "High-level modules should depend upon abstractions, not concrete implementations."
            }
          ],
          "shortcuts": [
            {
              "title": "Composition Over Inheritance Rule",
              "tip": "Favor \"has-a\" composition over \"is-a\" inheritance. Composition provides loose coupling, black-box reuse, and runtime behavioral swapping without fragile base class problems.",
              "example": "Car has an Engine instead of Car extends Engine."
            }
          ],
          "solvedExamples": [
            {
              "question": "Can you override a static method in Java or C++? Explain why.",
              "stepByStep": [
                "No, static methods cannot be overridden.",
                "Static methods are resolved at compile-time using the reference type (static binding).",
                "Method overriding requires runtime dynamic dispatch based on the actual object instance (dynamic binding via vtable).",
                "Defining a static method with the same signature in a subclass results in Method Hiding, not overriding."
              ],
              "answer": "No, static methods are bonded at compile-time (Method Hiding)."
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "oop-p1",
            "question": "Which SOLID principle states that objects of a superclass should be replaceable with objects of a subclass without breaking application correctness?",
            "options": [
              "Liskov Substitution Principle (LSP)",
              "Single Responsibility Principle",
              "Open/Closed Principle",
              "Interface Segregation Principle"
            ],
            "correctIndex": 0,
            "hint": "Named after Barbara Liskov; a classic violation is the Square extending Rectangle problem.",
            "explanation": "LSP requires subclasses to satisfy all behavioral contracts of their parent class without throwing unexpected exceptions."
          }
        ],
        "topicTest": [
          {
            "id": "oop-t1",
            "question": "What is the primary difference between an Abstract Class and an Interface in Java / modern OOP?",
            "options": [
              "An abstract class can maintain instance state (fields) and constructors, whereas an interface primarily specifies behavioral contracts",
              "Interfaces can be instantiated directly with \"new\"",
              "A class can extend multiple abstract classes",
              "There is no difference"
            ],
            "correctIndex": 0,
            "explanation": "Abstract classes represent an \"is-a\" identity hierarchy with state and constructors; interfaces define \"can-do\" behavioral contracts and support multiple implementation."
          }
        ]
      },
      {
        "id": "cs-dbms",
        "title": "Database Management Systems (DBMS)",
        "subject": "CS Fundamentals",
        "category": "DBMS",
        "badge": "Core Theory",
        "estimatedTime": "30 mins",
        "summary": "ACID properties, database normalization (1NF to BCNF), transaction isolation levels, and concurrency control.",
        "concept": {
          "overview": "DBMS manages structured data storage, querying, and transactional consistency. Placements emphasize ACID guarantees, indexing mechanisms (B-Trees), Normalization forms, and deadlock management.",
          "formulas": [
            {
              "name": "ACID Transaction Guarantees",
              "formula": "A: Atomicity (All or Nothing) | C: Consistency (Valid State Invariants) | I: Isolation (Concurrent Independence) | D: Durability (Committed Data Persists)",
              "whenToUse": "Evaluating transactional integrity in relational engines.",
              "notes": "Atomicity handled by Write-Ahead Logging (WAL); Durability guaranteed by non-volatile disk flushes."
            },
            {
              "name": "Database Normalization Hierarchy",
              "formula": "1NF: Atomic values | 2NF: 1NF + No partial dependencies | 3NF: 2NF + No transitive dependencies | BCNF: Every determinant is a candidate key",
              "whenToUse": "Eliminating insertion, deletion, and update anomalies in schema design.",
              "notes": "Over-normalization can increase JOIN query overhead."
            }
          ],
          "shortcuts": [
            {
              "title": "Transaction Isolation Anomalies",
              "tip": "Read Uncommitted allows Dirty Reads. Read Committed prevents Dirty Reads. Repeatable Read prevents Non-Repeatable Reads. Serializable prevents Phantom Reads.",
              "example": "Higher isolation levels reduce concurrency throughput."
            }
          ],
          "solvedExamples": [
            {
              "question": "What is a Dirty Read in database concurrency?",
              "stepByStep": [
                "Transaction A modifies a row without committing.",
                "Transaction B reads the uncommitted row.",
                "Transaction A subsequently rolls back (aborts).",
                "Transaction B has acted upon data that never officially existed in the database."
              ],
              "answer": "Reading uncommitted data that is subsequently rolled back."
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "dbms-p1",
            "question": "Which property of ACID transactions ensures that once a transaction commits, its updates survive system crashes or power failures?",
            "options": [
              "Durability",
              "Atomicity",
              "Isolation",
              "Consistency"
            ],
            "correctIndex": 0,
            "hint": "Write-ahead log (WAL) and disk persistence guarantee this property.",
            "explanation": "Durability guarantees that committed data is safely recorded to non-volatile storage and will survive crashes."
          }
        ],
        "topicTest": [
          {
            "id": "dbms-t1",
            "question": "Why do relational databases (MySQL, PostgreSQL) utilize B+ Trees instead of Binary Search Trees for disk indexing?",
            "options": [
              "B+ Trees have massive branching factors (fan-out) that minimize disk I/O seek operations",
              "Binary search trees are faster on disk",
              "B+ Trees do not require balanced height",
              "B+ Trees occupy zero memory"
            ],
            "correctIndex": 0,
            "explanation": "Disk I/O is orders of magnitude slower than RAM. High fan-out B+ Trees store hundreds of keys per node, keeping tree height <= 3-4 and drastically reducing disk seeks."
          }
        ]
      },
      {
        "id": "cs-sql",
        "title": "SQL & Relational Databases",
        "subject": "CS Fundamentals",
        "category": "SQL",
        "badge": "High Frequency",
        "estimatedTime": "25 mins",
        "summary": "Master SQL JOINs (Inner, Left, Right, Full), GROUP BY vs HAVING, subqueries, indexing, and window functions (ROW_NUMBER, RANK).",
        "concept": {
          "overview": "Structured Query Language (SQL) is the standard language for relational databases. Technical interviews frequently ask for 2nd highest salary, aggregate group statistics, and complex table JOINs.",
          "formulas": [
            {
              "name": "SQL Execution Order",
              "formula": "FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT",
              "whenToUse": "Understanding why column aliases defined in SELECT cannot be used inside WHERE clauses.",
              "notes": "WHERE filters individual rows before grouping; HAVING filters aggregated groups."
            },
            {
              "name": "Nth Highest Salary Query",
              "formula": "SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET (N-1);",
              "whenToUse": "Finding rank-based compensation values without subquery overhead.",
              "notes": "In window functions: DENSE_RANK() OVER (ORDER BY salary DESC)."
            }
          ],
          "shortcuts": [
            {
              "title": "RANK() vs DENSE_RANK() Distinction",
              "tip": "RANK() skips numbers on ties (1, 2, 2, 4). DENSE_RANK() does not skip numbers on ties (1, 2, 2, 3).",
              "example": "For 2nd highest salary with duplicate top salaries, DENSE_RANK() returns the true distinct 2nd level."
            }
          ],
          "solvedExamples": [
            {
              "question": "Write a SQL query to find employees who earn more than their managers. Schema: Employee (id, name, salary, managerId).",
              "stepByStep": [
                "Perform a Self JOIN on Employee table: e for employee, m for manager.",
                "JOIN condition: e.managerId = m.id.",
                "Filter: WHERE e.salary > m.salary.",
                "Query: SELECT e.name AS Employee FROM Employee e JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary;"
              ],
              "answer": "Self JOIN matching managerId to id"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "sql-p1",
            "question": "What is the fundamental difference between the WHERE clause and the HAVING clause in SQL?",
            "options": [
              "WHERE filters rows before aggregation; HAVING filters groups after GROUP BY aggregation",
              "HAVING filters individual rows; WHERE works on groups",
              "They are completely interchangeable",
              "WHERE cannot be used with SELECT"
            ],
            "correctIndex": 0,
            "hint": "You cannot use aggregate functions like COUNT() or SUM() inside a standard WHERE clause.",
            "explanation": "WHERE filters input rows before aggregation; HAVING evaluates filter conditions on aggregated group results."
          }
        ],
        "topicTest": [
          {
            "id": "sql-t1",
            "question": "What does a LEFT OUTER JOIN return when a row in the left table has no matching row in the right table?",
            "options": [
              "All columns from the left table with NULL values in right table columns",
              "The row is excluded from the result",
              "An SQL execution error",
              "Zero in all columns"
            ],
            "correctIndex": 0,
            "explanation": "LEFT JOIN preserves all rows from the left table regardless of matches, filling unmatched right columns with NULL."
          }
        ]
      },
      {
        "id": "cs-os",
        "title": "Operating Systems (OS)",
        "subject": "CS Fundamentals",
        "category": "Operating Systems",
        "badge": "Core Theory",
        "estimatedTime": "30 mins",
        "summary": "Process vs Thread, CPU scheduling algorithms, Deadlock Coffman conditions, virtual memory, paging, and page replacement.",
        "concept": {
          "overview": "Operating Systems manage computer hardware and resources. Technical interviews evaluate Process Synchronization (Mutex vs Semaphore), Deadlock conditions, CPU scheduling (Round Robin, SJF), and Virtual Memory paging.",
          "formulas": [
            {
              "name": "4 Coffman Conditions for Deadlock",
              "formula": "1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, 4) Circular Wait",
              "whenToUse": "Analyzing deadlocks in concurrent software.",
              "notes": "Breaking ANY single condition prevents deadlocks from occurring."
            },
            {
              "name": "Turnaround & Waiting Time",
              "formula": "Turnaround Time = Completion Time - Arrival Time | Waiting Time = Turnaround Time - Burst Time",
              "whenToUse": "Evaluating CPU scheduling efficiency.",
              "notes": "SJF minimizes average waiting time."
            }
          ],
          "shortcuts": [
            {
              "title": "Process vs Thread Difference",
              "tip": "A Process has its own independent address space (PCB, memory). A Thread is a lightweight sub-unit sharing the parent process code, data, and open files, but having its own private Stack and Program Counter.",
              "example": "Thread context switching is vastly faster than process context switching."
            }
          ],
          "solvedExamples": [
            {
              "question": "What is the difference between a Binary Semaphore and a Mutex?",
              "stepByStep": [
                "A Mutex is a locking mechanism with ownership: only the thread that acquired the mutex can release it.",
                "A Semaphore is a signaling mechanism without ownership: any thread can signal/post (increment) a semaphore locked by another thread.",
                "Mutex protects critical sections; Semaphore handles resource pools and signaling synchronization."
              ],
              "answer": "Mutex has ownership; Semaphore is a signaling construct."
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "os-p1",
            "question": "What is \"Thrashing\" in an operating system?",
            "options": [
              "A state where the CPU spends more time swapping pages in/out of disk than executing instructions",
              "A CPU hardware overheat shutdown",
              "A deadlock between two threads",
              "A corrupted disk sector"
            ],
            "correctIndex": 0,
            "hint": "Occurs when total working set of processes exceeds physical RAM capacity.",
            "explanation": "Thrashing occurs when high page fault frequency causes the OS to spend excessive time swapping pages between RAM and swap disk."
          }
        ],
        "topicTest": [
          {
            "id": "os-t1",
            "question": "Which page replacement algorithm suffers from Belady's Anomaly (where increasing the number of page frames causes MORE page faults)?",
            "options": [
              "First-In, First-Out (FIFO)",
              "Least Recently Used (LRU)",
              "Optimal Page Replacement (OPT)",
              "Least Frequently Used (LFU)"
            ],
            "correctIndex": 0,
            "explanation": "FIFO does not belong to the class of stack algorithms, and can suffer from Belady's Anomaly where allocating more physical memory increases page faults."
          }
        ]
      },
      {
        "id": "cs-cn",
        "title": "Computer Networks (CN)",
        "subject": "CS Fundamentals",
        "category": "Computer Networks",
        "badge": "Core Theory",
        "estimatedTime": "30 mins",
        "summary": "OSI 7 Layers vs TCP/IP model, TCP 3-way handshake vs UDP, DNS resolution, HTTP/HTTPS, SSL/TLS, and IPv4 subnetting.",
        "concept": {
          "overview": "Computer Networks govern data communication across distributed systems. Interview essentials include TCP vs UDP tradeoffs, the 3-Way Handshake, DNS resolution flow, HTTPS symmetric/asymmetric encryption, and CIDR subnetting.",
          "formulas": [
            {
              "name": "TCP 3-Way Handshake Flow",
              "formula": "Client -> SYN -> Server | Server -> SYN-ACK -> Client | Client -> ACK -> Server",
              "whenToUse": "Establishing reliable full-duplex TCP stream connection.",
              "notes": "Connection termination uses 4-way handshake (FIN, ACK, FIN, ACK)."
            },
            {
              "name": "OSI 7 Layer Hierarchy (Top to Bottom)",
              "formula": "Application -> Presentation -> Session -> Transport -> Network -> Data Link -> Physical",
              "whenToUse": "Protocol mapping (E.g., HTTP is Application, TCP is Transport, IP is Network).",
              "notes": "Mnemonic: \"All People Seem To Need Data Processing\"."
            }
          ],
          "shortcuts": [
            {
              "title": "TCP vs UDP Fast Comparison",
              "tip": "TCP is connection-oriented, reliable (acknowledgments + retransmissions), ordered, and has congestion control. UDP is connectionless, unreliable, unordered, lightweight, and low-latency (ideal for live video, DNS, gaming).",
              "example": "HTTP/2 uses TCP; HTTP/3 uses QUIC over UDP."
            }
          ],
          "solvedExamples": [
            {
              "question": "What happens under the hood when you type \"https://www.google.com\" into a browser and press Enter?",
              "stepByStep": [
                "1. DNS Resolution: Browser checks cache, OS cache, router cache, and queries DNS recursive resolver to find Google IP address.",
                "2. TCP Connection: 3-way handshake (SYN, SYN-ACK, ACK) establishes socket connection on port 443.",
                "3. TLS Handshake: Server sends SSL certificate; client validates certificate authority; symmetric session key is negotiated via asymmetric cryptography.",
                "4. HTTP Request: Client sends encrypted GET request over TLS socket.",
                "5. Response & Render: Server returns HTML/CSS/JS; browser parses DOM, constructs CSSOM, and paints page."
              ],
              "answer": "DNS -> TCP Handshake -> TLS Handshake -> HTTP GET -> DOM Rendering"
            }
          ]
        },
        "practiceQuestions": [
          {
            "id": "cn-p1",
            "question": "Which transport layer protocol is connectionless and does not guarantee packet delivery or ordering?",
            "options": [
              "UDP (User Datagram Protocol)",
              "TCP (Transmission Control Protocol)",
              "BGP",
              "ICMP"
            ],
            "correctIndex": 0,
            "hint": "Used in streaming, DNS queries, and multiplayer games where speed takes priority over retransmissions.",
            "explanation": "UDP sends datagrams without establishing a handshake or verifying receipt, providing lightweight minimal overhead."
          }
        ],
        "topicTest": [
          {
            "id": "cn-t1",
            "question": "Why does HTTPS use hybrid encryption (both Asymmetric and Symmetric cryptography)?",
            "options": [
              "Asymmetric encryption securely exchanges a symmetric session key, then fast symmetric encryption encrypts the bulk data transfer",
              "Symmetric encryption is not secure enough for key exchange",
              "Asymmetric encryption is too fast",
              "HTTPS only uses hashing"
            ],
            "correctIndex": 0,
            "explanation": "Asymmetric encryption (RSA/ECC) solves key distribution securely, but is computationally heavy. Once the symmetric key is agreed upon, fast symmetric encryption (AES) protects payload data."
          }
        ]
      }
    ]
  }
];

export default CURRICULUM;
