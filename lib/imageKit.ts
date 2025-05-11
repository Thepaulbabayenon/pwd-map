// lib/imageKit.ts
import ImageKit from "imagekit";

// Initialize ImageKit with your configuration
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? (() => { 
    console.error("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY is not defined in environment variables");
    throw new Error("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY is not defined"); 
  })(),
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? (() => { 
    console.error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables");
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined"); 
  })(),
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? (() => { 
    console.error("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is not defined in environment variables");
    throw new Error("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is not defined"); 
  })(),
});

// Generate auth parameters for client-side uploads
export async function getImageKitAuthParams() {
  try {
    // Log environment variables (without showing full private key)
    console.log("Environment check:", {
      publicKeyExists: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      privateKeyExists: !!process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpointExists: !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
      publicKeyValue: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      urlEndpointValue: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });
    
    // Generate authentication token
    const token = imagekit.getAuthenticationParameters();
    
    // Verify the token has all required fields
    if (!token.token || !token.signature || !token.expire) {
      console.error("ImageKit authentication parameters incomplete:", token);
      throw new Error("Failed to generate complete authentication parameters");
    }
    
    // Add public key to the response if not already included
    const authParams = {
      ...token,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
    };
    
    console.log("Generated auth parameters:", {
      ...authParams,
      signature: authParams.signature ? `${authParams.signature.substring(0, 10)}...` : null
    });
    
    return authParams;
  } catch (error) {
    console.error("Error generating ImageKit auth parameters:", error);
    throw error;
  }
}

// app/api/imagekit/route.ts
export async function GET() {
  try {
    console.log('ImageKit auth endpoint called');
    const authParams = await getImageKitAuthParams();
    
    return Response.json(authParams);
  } catch (error) {
    console.error('Error in ImageKit API route:', error);
    return Response.json(
      { 
        error: 'Failed to generate auth parameters', 
        details: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error)
      },
      { status: 500 }
    );
  }
}