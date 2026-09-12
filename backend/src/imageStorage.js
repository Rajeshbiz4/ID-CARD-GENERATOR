import mongoose from "mongoose";
import multer from "multer";
import { GridFSBucket, ObjectId } from "mongodb";

export const imageUpload=multer({
  storage:multer.memoryStorage(),
  limits:{fileSize:5*1024*1024},
  fileFilter(req,file,cb){
    const allowed=new Set(["image/jpeg","image/png","image/webp"]);
    if(!allowed.has(file.mimetype)) return cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    cb(null,true);
  }
});

function bucket(){ return new GridFSBucket(mongoose.connection.db,{bucketName:"schoolImages"}); }

export async function storeImage({file,schoolId,category}){
  if(!file) throw new Error("Image file is required.");
  const stream=bucket().openUploadStream(`${Date.now()}-${file.originalname}`,{
    contentType:file.mimetype,
    metadata:{schoolId:String(schoolId),category:category||"image",originalName:file.originalname}
  });
  return await new Promise((resolve,reject)=>{
    stream.on("error",reject);
    stream.on("finish",()=>resolve(stream.id));
    stream.end(file.buffer);
  });
}

export async function getOwnedImage(fileId,schoolId,isAdmin=false){
  if(!ObjectId.isValid(fileId)) return null;
  const file=await mongoose.connection.db.collection("schoolImages.files").findOne({_id:new ObjectId(fileId)});
  if(!file) return null;
  if(!isAdmin && String(file.metadata?.schoolId||"")!==String(schoolId||"")) return null;
  return file;
}

export function openImage(fileId){ return bucket().openDownloadStream(new ObjectId(fileId)); }

export async function deleteOwnedImage(fileId,schoolId,isAdmin=false){
  const file=await getOwnedImage(fileId,schoolId,isAdmin);
  if(!file) return false;
  await bucket().delete(file._id);
  return true;
}


export async function deleteSchoolImages(
  schoolId
) {
  const files =
    await mongoose.connection.db
      .collection(
        "schoolImages.files"
      )
      .find({
        "metadata.schoolId":
          String(
            schoolId
          ),
      })
      .project({
        _id: 1,
      })
      .toArray();

  const gridBucket =
    bucket();

  for (
    const file
    of files
  ) {
    await gridBucket.delete(
      file._id
    );
  }

  return files.length;
}
