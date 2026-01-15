import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        paymentMethod: {
          select: {
            id: true,
            name: true,
            type: true,
            subtype: true,
            mask: true,
            institutionName: true,
          },
        },
        merchant: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        cashTransaction: {
          select: {
            shopName: true,
            submittedAt: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Format location according to new requirements
    let locationDisplay = "Unknown"
    if (transaction.location) {
      try {
        const locationData = typeof transaction.location === "string" 
          ? JSON.parse(transaction.location) 
          : transaction.location
        
        // Check if it's an online transaction
        if (locationData.online === true || locationData.city === null || 
            (locationData.address === null && locationData.city === null && locationData.region === null)) {
          // Online transaction - show website if available
          if (locationData.url || locationData.website || locationData.website_name) {
            const url = locationData.url || locationData.website || ""
            const websiteName = locationData.website_name || ""
            
            if (websiteName) {
              locationDisplay = websiteName
            } else if (url) {
              try {
                const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
                locationDisplay = urlObj.hostname.replace("www.", "")
              } catch (e) {
                // If URL parsing fails, try to extract domain from string
                const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/i)
                locationDisplay = match ? match[1] : "Unknown Online Source"
              }
            } else {
              locationDisplay = "Unknown Online Source"
            }
          } else {
            // Check if merchant name contains a URL pattern and extract domain
            const merchantName = transaction.merchantName || ""
            const urlPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)/gi
            const urlMatch = merchantName.match(urlPattern)
            if (urlMatch && urlMatch.length > 0) {
              try {
                const urlObj = new URL(urlMatch[0].startsWith("http") ? urlMatch[0] : `https://${urlMatch[0]}`)
                locationDisplay = urlObj.hostname.replace("www.", "")
              } catch (e) {
                locationDisplay = urlMatch[0].replace(/^https?:\/\//, "").replace(/^www\./, "")
              }
            } else {
              locationDisplay = "Unknown Online Source"
            }
          }
        } else {
          // Physical location - prioritize street address, then city, then fallback
          if (locationData.address && locationData.address.trim() !== "") {
            // Street address is available
            locationDisplay = locationData.address.trim()
          } else if (locationData.city && locationData.city.trim() !== "") {
            // Only city is available
            locationDisplay = locationData.city.trim()
          } else {
            // Physical location but no address or city
            locationDisplay = "Unknown Physical Location"
          }
        }
      } catch (e) {
        locationDisplay = "Unknown"
      }
    }

    // Format payment method - just type/subtype and last 4 digits, no "Bank Account" or "Credit Card" prefix
    let paymentMethodDisplay = "Cash"
    if (transaction.paymentMethod) {
      const pm = transaction.paymentMethod
      // Use subtype if available (e.g., "checking", "savings", "credit card"), otherwise fallback to type
      let typeDisplay = ""
      if (pm.subtype) {
        // Capitalize first letter and replace underscores with spaces
        typeDisplay = pm.subtype.charAt(0).toUpperCase() + pm.subtype.slice(1).replace(/_/g, " ")
      } else if (pm.type === "depository") {
        typeDisplay = "Checking"
      } else if (pm.type === "credit") {
        typeDisplay = "Credit card"
      } else if (pm.type === "loan") {
        typeDisplay = "Loan"
      } else {
        typeDisplay = pm.type ? pm.type.charAt(0).toUpperCase() + pm.type.slice(1) : "Account"
      }
      const maskDisplay = pm.mask ? ` •••• ${pm.mask}` : ""
      paymentMethodDisplay = `${typeDisplay}${maskDisplay}`
    }

    // Get store logo URL for well-known stores
    function getStoreLogoUrl(storeName: string): string | null {
      const normalizedName = storeName.toLowerCase().trim()
      
      // Map of well-known stores to their logo URLs
      // Using publicly available logo URLs from common CDNs
      const storeLogoMap: { [key: string]: string } = {
        "mcdonalds": "https://logo.clearbit.com/mcdonalds.com",
        "mcdonald's": "https://logo.clearbit.com/mcdonalds.com",
        "starbucks": "https://logo.clearbit.com/starbucks.com",
        "target": "https://logo.clearbit.com/target.com",
        "walmart": "https://logo.clearbit.com/walmart.com",
        "amazon": "https://logo.clearbit.com/amazon.com",
        "costco": "https://logo.clearbit.com/costco.com",
        "home depot": "https://logo.clearbit.com/homedepot.com",
        "homedepot": "https://logo.clearbit.com/homedepot.com",
        "lowes": "https://logo.clearbit.com/lowes.com",
        "best buy": "https://logo.clearbit.com/bestbuy.com",
        "bestbuy": "https://logo.clearbit.com/bestbuy.com",
        "nike": "https://logo.clearbit.com/nike.com",
        "adidas": "https://logo.clearbit.com/adidas.com",
        "subway": "https://logo.clearbit.com/subway.com",
        "taco bell": "https://logo.clearbit.com/tacobell.com",
        "tacobell": "https://logo.clearbit.com/tacobell.com",
        "kfc": "https://logo.clearbit.com/kfc.com",
        "dominos": "https://logo.clearbit.com/dominos.com",
        "domino's": "https://logo.clearbit.com/dominos.com",
        "pizza hut": "https://logo.clearbit.com/pizzahut.com",
        "pizzahut": "https://logo.clearbit.com/pizzahut.com",
        "burger king": "https://logo.clearbit.com/burgerking.com",
        "burgerking": "https://logo.clearbit.com/burgerking.com",
        "chick-fil-a": "https://logo.clearbit.com/chick-fil-a.com",
        "chick fil a": "https://logo.clearbit.com/chick-fil-a.com",
        "chipotle": "https://logo.clearbit.com/chipotle.com",
        "whole foods": "https://logo.clearbit.com/wholefoodsmarket.com",
        "wholefoods": "https://logo.clearbit.com/wholefoodsmarket.com",
        "trader joes": "https://logo.clearbit.com/traderjoes.com",
        "trader joe's": "https://logo.clearbit.com/traderjoes.com",
        "kroger": "https://logo.clearbit.com/kroger.com",
        "safeway": "https://logo.clearbit.com/safeway.com",
        "publix": "https://logo.clearbit.com/publix.com",
        "walgreens": "https://logo.clearbit.com/walgreens.com",
        "cvs": "https://logo.clearbit.com/cvs.com",
        "rite aid": "https://logo.clearbit.com/riteaid.com",
        "riteaid": "https://logo.clearbit.com/riteaid.com",
        "petco": "https://logo.clearbit.com/petco.com",
        "petsmart": "https://logo.clearbit.com/petsmart.com",
      }
      
      // Try exact match first
      if (storeLogoMap[normalizedName]) {
        return storeLogoMap[normalizedName]
      }
      
      // Try partial matches (e.g., "McDonald's #1234" -> "mcdonald's")
      for (const [key, logoUrl] of Object.entries(storeLogoMap)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
          return logoUrl
        }
      }
      
      return null
    }

    const storeLogoUrl = getStoreLogoUrl(transaction.merchantName)

    // Format response to match UI expectations
    const formatted = {
      id: transaction.id,
      storeName: transaction.merchantName,
      date: transaction.date.toISOString().split("T")[0],
      location: locationDisplay,
      transactionNumber: transaction.id.slice(-8).toUpperCase(),
      paymentMethod: paymentMethodDisplay,
      barcode: transaction.cashTransaction
        ? `*${transaction.id.slice(-8).toUpperCase()}*`
        : null,
      items: [], // Items not stored in current schema - can be added later
      subtotal: Number(transaction.amount),
      tax: 0, // Tax not stored separately - can be calculated or added to schema
      total: Number(transaction.amount),
      category: transaction.category,
      notes: transaction.notes,
      source: transaction.source,
      shopName: transaction.cashTransaction?.shopName,
      storeLogoUrl, // Add logo URL to response
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    )
  }
}

