import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token)

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const caption = formData.get("caption") as string
    const tagsJson = formData.get("tags") as string

    if (!file || !caption) {
      return NextResponse.json({ error: "Missing file or caption" }, { status: 400 })
    }

    const tags = JSON.parse(tagsJson || "[]")

    const timestamp = Date.now()
    const filename = `${userData.user.id}/${timestamp}-${file.name}`

    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from("ootd-images")
      .upload(filename, file, {
        upsert: false,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data } = supabaseServer.storage.from("ootd-images").getPublicUrl(filename)

    const image_url = data.publicUrl

    // Create post record
    const { data: postData, error: postError } = await supabaseServer
      .from("posts")
      .insert([
        {
          user_id: userData.user.id,
          caption,
          tags,
          image_url,
        },
      ])
      .select()

    if (postError) {
      throw new Error(postError.message)
    }

    return NextResponse.json(postData[0], { status: 201 })
  } catch (error) {
    console.error("[POST /api/posts/upload]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
