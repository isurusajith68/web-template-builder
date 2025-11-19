const gallery = Vue.createApp({
  data() {
    return {
      hotelId: null,
      orgId: null,
      templateId: 1,
      title: "Site Name",
      email: "Site email",
      phoneNumber: "Site phone number",
      address: "Site address",

      images: [],
      footerDescription: "Click to Edit Footer Description",

      userUseRealImages: false,
      realImages: [],
      carouselImages: [
        {
          src: "img/carousel-1.jpg",
          alt: "Carousel Image 1",
          carouselTitle: "Luxury Living",
          carouselDescription: "A luxury tourist residence...",
        },
        {
          src: "img/carousel-2.jpg",
          alt: "Carousel Image 2",
          carouselTitle: "Luxury Living",
          carouselDescription: "A luxury tourist residence...",
        },
      ],

      isLoading: null,
      isError: null,
      isSuccess: null,

      // Image cropping properties
      cropper: null,
      selectedFiles: [],
      croppedImages: [],
      currentCropIndex: 0,
      cropModalInstance: null,
      isCropping: false,

      facebookLink: "",
      bookingcomLink: "",
      tripadvisorLink: "",
      youtubeLink: "",
    };
  },

  methods: {
    handleFileChange(event) {
      const files = Array.from(event.target.files);

      if (files.length === 0) return;

      // Validate files
      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          alert(`${file.name} is too large. Maximum size is 5MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      this.selectedFiles = validFiles;
      this.croppedImages = [];
      this.currentCropIndex = 0;
      this.openCropModal();
    },

    openCropModal() {
      if (this.selectedFiles.length === 0) return;

      this.cropModalInstance = new bootstrap.Modal(
        document.getElementById("imageCropModal")
      );
      this.cropModalInstance.show();

      // Initialize cropper after modal is shown
      document.getElementById("imageCropModal").addEventListener(
        "shown.bs.modal",
        () => {
          this.initializeCropper();
        },
        { once: true }
      );
    },

    initializeCropper() {
      if (this.currentCropIndex >= this.selectedFiles.length) return;

      const file = this.selectedFiles[this.currentCropIndex];
      const reader = new FileReader();

      reader.onload = (e) => {
        const cropImage = this.$refs.cropImage;
        cropImage.src = e.target.result;

        if (this.cropper) {
          this.cropper.destroy();
        }

        this.cropper = new Cropper(cropImage, {
          aspectRatio: 1.5 / 1, // Landscape aspect ratio for gallery images (1.5:1)
          viewMode: 1,
          dragMode: "move",
          autoCropArea: 0.8,
          restore: false,
          guides: true,
          center: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
          minCropBoxWidth: 150,
          minCropBoxHeight: 100,
        });
      };

      reader.readAsDataURL(file);
    },

    cropAndNext() {
      if (!this.cropper) {
        console.error("Cropper not initialized");
        return;
      }

      this.isCropping = true;

      // Get cropped canvas
      const canvas = this.cropper.getCroppedCanvas({
        width: 1920,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      if (!canvas) {
        console.error("Failed to get cropped canvas");
        this.isCropping = false;
        return;
      }

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Failed to create blob from canvas");
            this.isCropping = false;
            return;
          }

          // Create a new file with the cropped data
          const originalFile = this.selectedFiles[this.currentCropIndex];
          const croppedFile = new File([blob], `cropped_${originalFile.name}`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          this.croppedImages.push(croppedFile);
          this.currentCropIndex++;

          if (this.currentCropIndex < this.selectedFiles.length) {
            // More images to crop
            this.initializeCropper();
          } else {
            // All images cropped, upload them
            this.uploadCroppedImages();
          }

          this.isCropping = false;
        },
        "image/jpeg",
        0.8
      );
    },

    uploadCroppedImages() {
      const formData = new FormData();

      this.croppedImages.forEach((file, index) => {
        formData.append("images", file);
      });

      this.closeCropModal();
      this.uploadImages(formData);

      // Reset for next upload
      this.selectedFiles = [];
      this.croppedImages = [];
      this.currentCropIndex = 0;

      // Clear the file input
      const fileInput = document.getElementById("files");
      if (fileInput) {
        fileInput.value = "";
      }
    },

    closeCropModal() {
      if (this.cropper) {
        this.cropper.destroy();
        this.cropper = null;
      }

      if (this.cropModalInstance) {
        this.cropModalInstance.hide();
      }

      this.selectedFiles = [];
      this.croppedImages = [];
      this.currentCropIndex = 0;
      this.isCropping = false;
    },

    triggerFileInput() {
      const fileInput = document.getElementById("files");
      if (fileInput) {
        fileInput.click();
      }
    },

    onDragOver(event) {
      event.preventDefault();
      const uploadArea = event.target.closest(".upload-area");
      if (uploadArea) {
        uploadArea.style.borderColor = "#007bff";
        uploadArea.style.backgroundColor = "#f8f9ff";
      }
    },

    onDragLeave(event) {
      event.preventDefault();
      const uploadArea = event.target.closest(".upload-area");
      if (uploadArea) {
        uploadArea.style.borderColor = "#dee2e6";
        uploadArea.style.backgroundColor = "transparent";
      }
    },

    onDrop(event) {
      event.preventDefault();
      const uploadArea = event.target.closest(".upload-area");
      if (uploadArea) {
        uploadArea.style.borderColor = "#dee2e6";
        uploadArea.style.backgroundColor = "transparent";
      }

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        // Create a mock event object for handleFileChange
        const mockEvent = {
          target: {
            files: files,
          },
        };
        this.handleFileChange(mockEvent);
      }
    },

    removeRealImage(imageIndex) {
      const imageName = this.imageRows.flat()[imageIndex];
      this.removeImageFromServer(imageName);
    },

    async removeImageFromServer(imageName) {
      try {
        const response = await fetch(
          "https://webtemplateapi.ceyinfo.com/temp1/remove-image",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hotelId: this.hotelId,
              templateId: this.templateId,
              imageName: imageName,
            }),
            credentials: "include",
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          this.realImages = this.realImages.filter(
            (image) => image !== imageName
          );

          this.isLoading = null;
          this.isSuccess = "Image removed successfully";

          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        } else {
          this.isLoading = null;
          this.isError = "Error removing image";

          setTimeout(() => {
            this.isError = null;
          }, 5000);
        }
      } catch (error) {
        this.isLoading = null;
        this.isError = "Error removing image";

        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    async uploadImages(formData) {
      this.isLoading = "Uploading...";

      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/upload-images?hotelId=${this.hotelId}&templateId=${this.templateId}`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Images uploaded successfully:", data);

          this.userUseRealImages = true;
          this.realImages = data.images.filePaths;
          console.log("Real images:", this.realImages);

          this.isLoading = null;
          this.isSuccess = "Images uploaded successfully";

          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        } else {
          const errorText = await response.text();
          console.error("Error uploading images:", errorText);

          this.isLoading = null;
          this.isError = "Error uploading images";

          setTimeout(() => {
            this.isError = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        this.isLoading = null;
        this.isError = "Error uploading images";

        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },

    async saveImages() {
      const hotelId = 1;
      const templateId = 1;
      this.isLoading = "Saving...";
      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/upload-images?hotelId=${this.hotelId}&templateId=${this.templateId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hotelId,
              templateId,
              images: this.realImages,
            }),
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error saving images:", errorText);
          this.isLoading = null;
          this.isError = "Error saving details";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const data = await response.json();
          console.log("Images saved successfully:", data);
          this.isLoading = null;
          this.isSuccess = "Details saved successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error saving images:", error);
        this.isLoading = null;
        this.isError = "Error saving details";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    async hotelInfo() {
      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/hotel-info`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          const err = await response.json();

          console.error("Error fetching hotel info:", err);
          console.log(err);
          this.isLoading = null;
          this.isError = err.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          console.log("Hotel info fetched successfully:", result);

          if (result) {
            console.log("result", result.data.name);
            this.title = result.data.name;
            this.email = result.data.email;
            this.phoneNumber = result.data.mobile;
            this.address = result.data.address1;
            this.hotelId = result.data.id;
            this.orgId = result.data.orgId;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },
    async loadSiteDetails() {
      this.isLoading = "Loading site data...";

      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/site-details?templateId=${this.templateId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.json();
          console.error("Error loading site details:", errorText);
          this.isLoading = null;
          this.isError = errorText.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const siteDetails = await response.json();
          console.log("Site details loaded successfully:", siteDetails);
          if (siteDetails?.details?.realImages?.filePaths?.length > 0) {
            this.userUseRealImages = true;
            this.realImages.push(
              ...siteDetails?.details?.realImages?.filePaths
            );
            this.carouselImages = siteDetails?.details?.carouselImages;
            this.footerDescription =
              siteDetails?.details?.footerDescription || this.footerDescription;
          }

          this.facebookLink = siteDetails?.details?.facebookLink || "";
          this.bookingcomLink = siteDetails?.details?.bookingcomLink || "";
          this.tripadvisorLink = siteDetails?.details?.tripadvisorLink || "";
          this.youtubeLink = siteDetails?.details?.youtubeLink || "";

          // this.title = siteDetails.details.title;
          // this.email = siteDetails.details.email;
          // this.phoneNumber = siteDetails.details.phoneNumber;
          // this.title = siteDetails.details.title;
          // this.email = siteDetails.details.email;
          // this.phoneNumber = siteDetails.details.phoneNumber;
          this.isLoading = null;
          this.isSuccess = "Site details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error fetching site details:", error);
        // this.isLoading = null;
        // // this.isError = "Error fetching site details";
        // setTimeout(() => {
        //   this.isError = null;
        // }, 5000);
      }
    },
  },
  computed: {
    imageRows() {
      const sourceImages = this.userUseRealImages
        ? this.realImages
        : this.images;
      const rows = [];
      for (let i = 0; i < sourceImages.length; i += 2) {
        rows.push(sourceImages.slice(i, i + 2));
      }
      return rows;
    },
  },

  mounted() {
    this.loadSiteDetails();
    this.hotelInfo();

    // Handle modal cleanup on hide
    const modal = document.getElementById("imageCropModal");
    if (modal) {
      modal.addEventListener("hidden.bs.modal", () => {
        this.closeCropModal();
      });
    }
  },

  beforeUnmount() {
    // Clean up cropper instance
    if (this.cropper) {
      this.cropper.destroy();
    }
  },
});

gallery.mount("#gallery");
