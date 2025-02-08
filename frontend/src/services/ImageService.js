import axios from "axios";

function getCookie(name) {
  const value = document.cookie;
  if (!value) return null;
  const parts = value.split(`${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}


const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
    },
})

api.interceptors.request.use(config => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


export const ImageService = {
    uploadImage: async (imageBlob,title) => {
        const formData = new FormData()
        formData.append("image", imageBlob, "image.png")
        formData.append("title", title)

        try{
            const response = await api.post("/api/images/", formData)
            return response.data
        } catch (error) {
            console.error("Error uploading image", error)
            throw error
    }

},
    update_image: async (imageBlob,id,title) => {
        const formData = new FormData()
        formData.append("image", imageBlob, "image.png")
        formData.append("title", title)
       

        try{
            const response = await api.put(`/api/images/${id}/update_image/`, formData)
            return response.data
        } catch (error) {
            console.error("Error updating image", error)
            throw error
        }
    }, 
    getImages: async () => {
        try{
            const response = await api.get("/api/images/", {
      credentials: 'include'
    })
            return response.data
        } catch (error) {
            console.error("Error getting images", error)
            throw error
        }
    },
    deleteImage: async (id) => {
        try{
            const response = await api.delete(`/api/images/${id}/delete_image/`)
            return response.data
        } catch (error) {
            console.error("Error deleting image", error)
            throw error
        }
    },
    resize: async (blob, width, height) => {
        try{
            const formData = new FormData()
            formData.append("image",blob,"image.png")
            formData.append("width", width)
            formData.append("height", height)


            const response = await api.post("api/images/resize/", formData, {headers: {"Content-Type": "multipart/form-data"}, responseType: "blob"})
            return response.data
        }
        catch (error) {
            console.error("Error resizing image", error)
            throw error
        }
    },
    rotate: async (blob, degrees) => {
        try{
            const formData = new FormData()
            formData.append("image",blob,"image.png")
            formData.append("degrees", degrees)

            const response = await api.post("api/images/rotate/", formData, {headers: {"Content-Type": "multipart/form-data"}, responseType: "blob"})
            return response.data
        }
        catch (error) {
            console.error("Error rotating image", error)
            throw error
        }
    },
    transpose: async (blob,direction) => {
        try{
            const formData = new FormData()
            formData.append("image",blob,"image.png")
            formData.append("direction", direction)

            const response = await api.post("api/images/transpose/", formData, {headers: {"Content-Type": "multipart/form-data"}, responseType: "blob"})
            console.log(response)
            return response.data
        }
        catch (error) {
            console.error("Error transposing image", error)
            throw error
        }
    },
    blur: async (blob, x, y, radius) => {
        try{
            const formData = new FormData()
            formData.append("image",blob,"image.png")
            formData.append("x", x)
            formData.append("y", y)
            formData.append("radius", radius)

            const response = await api.post("api/images/blur/", formData, {headers: {"Content-Type": "multipart/form-data"}, responseType: "blob"})
            return response.data
        }
        catch (error) {
            console.error("Error blurring image", error)
            throw error
    }},
    crop: async (blob,width,height,x,y) => {
        try {
            const formData = new FormData()
            formData.append("image", blob, "image.png")
            formData.append("width", width)
            formData.append("height", height)
            formData.append("x", x)
            formData.append("y", y)

            const response = await api.post("api/images/crop/", formData, {headers: {"Content-Type": "multipart/form-data"}, responseType: "blob"})
            return response.data
        } catch (error) {
            console.error("Error cropping image", error)
            throw error
        }
    },
    generate: async (prompt,quality) => {
        try {
            const formData = new FormData()
            formData.append("prompt", prompt)
            formData.append("quality", quality)

            const response = await api.post("api/images/generate/", formData, {headers: {"Content-Type": "multipart/form-data", "Accept": "application/json"}})
            return response.data
        } catch (error) {
            console.error("Error generating image", error)
            throw error
        }
    }
}