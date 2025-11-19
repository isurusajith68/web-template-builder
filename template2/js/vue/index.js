const app = Vue.createApp({
  data() {
    return {
      hotelId: null,
      orgId: null,
      templateId: 2,
      title: "Click to edit site name",
      carouselImages: [
        {
          src: "./img/banner/banner.png",
          alt: "Image 1",
          carouselTitle: "Add slider title here",
          carouselDescription: "Add slider description here",
        },
        {
          src: "./img/banner/banner2.png",
          alt: "Image 2",
          carouselTitle: "Add slider title here",
          carouselDescription: "Add slider description here",
        },
      ],
      aboutUsTitle: "Add About Us Title Here",
      aboutUsDescription:
        "Add About Us Title Here    <br>                                     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed etiam facilisis, arcu id luctus. Nullam nec nisi sit amet purus tincidunt lacinia. Nullam nec nisi sit amet purus tincidunt lacinia. Nullam nec nisi sit amet purus tincidunt lacinia. Nullam nec nisi sit amet purus tincidunt lacinia.",
      aboutUsImages: [
        { src: "img/about/about_1.png", alt: "About Us Image 1" },
        { src: "img/about/about_2.png", alt: "About Us Image 2" },
      ],
      hotelFoodTitle: "We Serve Fresh and Delicious Food",
      hotelFoodDescription:
        "Add Hotel Food Description Here <br> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed etiam facilisis, arcu id luctus. Nullam nec nisi sit amet purus tincidunt lacinia. Nullam nec nisi sit amet purus tincidunt lacinia. Nullam nec nisi sit amet purus tincidunt lacinia. Nullam nec nisi sit amet purus tincidunt lacinia.",
      hotelFoodImages: [
        { src: "img/about/1.png", alt: "Hotel Food Image 1" },
        { src: "img/about/2.png", alt: "Hotel Food Image 2" },
      ],
      roomsDetails: [],
      phoneNumber: "0765280144",
      email: "",
      address: "",
      imageRoomBradCam: "./img/banner/bradcam.png",
      imageAboutBradCam: "./img/banner/bradcam2.png",
      imageContactBradCam: "./img/banner/bradcam3.png",
      mapIframeHtml: `<div style="max-width:100%;overflow:hidden;color:red;height:400px;"><div id="display-google-map" style="height:100%; width:100%;max-width:100%;"><iframe style="height:100%;width:100%;border:0;" frameborder="0" src="https://www.google.com/maps/embed/v1/place?q=hillroost&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"></iframe></div><a class="from-embedmap-code" href="https://www.bootstrapskins.com/themes" id="auth-map-data">premium bootstrap themes</a><style>#display-google-map img.text-marker{max-width:none!important;background:none!important;}img{max-width:none}</style></div>`,
      images: [
        "img/instragram/1.png",
        "img/instragram/2.png",
        "img/instragram/3.png",
        "img/instragram/4.png",
        "img/instragram/5.png",
      ],
      userUseRealImages: false,
      realImages: [],
      offers: [],
      editTitle: "",
      editCarouselImages: [
        { src: "", alt: "", carouselTitle: "", carouselDescription: "" },
        { src: "", alt: "", carouselTitle: "", carouselDescription: "" },
      ],
      editAboutUsTitle: "",
      editAboutUsDescription: "",
      editAboutUsImages: [
        { src: "", alt: "" },
        { src: "", alt: "" },
      ],
      editHotelFoodTitle: "",
      editHotelFoodDescription: "",
      editHotelFoodImages: [
        { src: "", alt: "" },
        { src: "", alt: "" },
      ],
      editPhoneNumber: "",

      isEditingCarouselImages: false,
      isEditingTitle: false,
      editCarouselText: [
        {
          isEditingCarouselTitle: false,
          isEditingCarouselDescription: false,
        },
        {
          isEditingCarouselTitle: false,
          isEditingCarouselDescription: false,
        },
      ],
      isEditAboutUsTitle: false,
      isEditAboutUsDescription: false,
      isEditHotelFoodTitle: false,
      isEditHotelFoodDescription: false,
      isEditPhoneNumber: false,

      isLoading: null,
      isError: null,
      isSuccess: null,

      // Crop modal data
      cropperInstance: null,
      cropImageSrc: "",
      cropAspectRatio: 1,
      currentCropCallback: null,
    };
  },

  methods: {
    editClickTitle() {
      this.isEditingTitle = true;
      this.editTitle = this.title;
    },
    updateTitle() {
      this.title = this.editTitle;
      this.isEditingTitle = false;
    },

    editClickPhoneNumber() {
      this.isEditPhoneNumber = true;
      this.editPhoneNumber = this.phoneNumber;
    },

    updatePhoneNumber() {
      this.phoneNumber = this.editPhoneNumber;
      this.isEditPhoneNumber = false;
    },

    editClickCarouselTitle(index) {
      this.editCarouselText[index].isEditingCarouselTitle = true;

      this.editCarouselImages[index].carouselTitle =
        this.carouselImages[index].carouselTitle;
    },

    updateCarouselTitle(index) {
      this.carouselImages[index].carouselTitle =
        this.editCarouselImages[index].carouselTitle;

      this.editCarouselText[index].isEditingCarouselTitle = false;
    },

    editClickCarouselDescription(index) {
      this.editCarouselText[index].isEditingCarouselDescription = true;

      this.editCarouselImages[index].carouselDescription =
        this.carouselImages[index].carouselDescription;
    },

    updateCarouselDescription(index) {
      this.carouselImages[index].carouselDescription =
        this.editCarouselImages[index].carouselDescription;

      this.editCarouselText[index].isEditingCarouselDescription = false;
    },

    triggerFileInput(index) {
      const fileInput = this.$refs["fileInput" + index];
      if (fileInput) {
        fileInput.click();
      } else {
        console.error(`File input for index ${index} not found.`);
      }
    },
    uploadImage(event, index) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.carouselImages[index].src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    editClickAboutTitle() {
      this.isEditAboutUsTitle = true;
      this.editAboutUsTitle = this.aboutUsTitle;
    },

    updateAboutTitle() {
      this.aboutUsTitle = this.editAboutUsTitle;
      this.isEditAboutUsTitle = false;
    },

    editClickAboutDescription() {
      this.isEditAboutUsDescription = true;
      this.editAboutUsDescription = this.aboutUsDescription;
    },

    updateAboutDescription() {
      this.aboutUsDescription = this.editAboutUsDescription;
      this.isEditAboutUsDescription = false;
    },

    triggerAboutUsImageUpload(index) {
      const fileInput = this.$refs["aboutImage" + index];
      if (fileInput) {
        fileInput.click();
      } else {
        console.error(`File input for index ${index} not found.`);
      }
    },
    uploadAboutUsImage(index) {
      this.openCropModal(9 / 16, (croppedFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.aboutUsImages[index].src = e.target.result;
        };
        reader.readAsDataURL(croppedFile);
      });
    },

    editClickHotelFoodTitle() {
      this.isEditHotelFoodTitle = true;
      this.editHotelFoodTitle = this.hotelFoodTitle;
    },

    updateHotelFoodTitle() {
      this.hotelFoodTitle = this.editHotelFoodTitle;
      this.isEditHotelFoodTitle = false;
    },

    editClickHotelFoodDescription() {
      this.isEditHotelFoodDescription = true;
      this.editHotelFoodDescription = this.hotelFoodDescription;
    },

    updateHotelFoodDescription() {
      this.hotelFoodDescription = this.editHotelFoodDescription;
      this.isEditHotelFoodDescription = false;
    },

    triggerHotelFoodImageUpload(index) {
      const fileInput = this.$refs["hotelFoodImage" + index];
      if (fileInput) {
        fileInput.click();
      } else {
        console.error(`File input for index ${index} not found.`);
      }
    },

    uploadHotelFoodImage(event, index) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.hotelFoodImages[index].src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    readFileAsync(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    triggerFileInputRoomBradCam() {
      this.$refs.fileInput.click();
    },

    async uploadImageRoomBradCam() {
      this.openCropModal(16 / 9, async (croppedFile) => {
        try {
          const imageDataUrl = await this.readFileAsync(croppedFile);
          this.imageRoomBradCam = imageDataUrl;
          await this.saveChanges();
        } catch (error) {
          console.error("Error reading file:", error);
        }
      });
    },
    triggerFileInputAboutUsBradCam() {
      this.$refs.fileInputAboutUs.click();
    },
    async uploadImageAboutUsBradCam() {
      this.openCropModal(16 / 9, async (croppedFile) => {
        try {
          const imageDataUrl = await this.readFileAsync(croppedFile);
          this.imageAboutBradCam = imageDataUrl;
          await this.saveChanges();
        } catch (error) {
          console.error("Error reading file:", error);
        }
      });
    },
    triggerFileInputContactBradCam() {
      this.$refs.fileInputContact.click();
    },
    async uploadImageContactBradCam() {
      this.openCropModal(16 / 9, async (croppedFile) => {
        try {
          const imageDataUrl = await this.readFileAsync(croppedFile);
          this.imageContactBradCam = imageDataUrl;
          await this.saveChanges();
        } catch (error) {
          console.error("Error reading file:", error);
        }
      });
    },
    async mapSrc() {
      try {
        const result = this.mapIframeHtml;
        await this.saveChanges();
        return result;
      } catch (error) {
        console.error("Error saving map source:", error);
      }
    },
    handleFileChange(event) {
      const files = Array.from(event.target.files);
      const maxFiles = 5;

      if (files.length > maxFiles) {
        this.isError = `You can upload a maximum of ${maxFiles} images.`;

        setTimeout(() => {
          this.isError = null;
        }, 5000);

        // Reset the input
        if (this.$refs.multipleImageInput) {
          this.$refs.multipleImageInput.value = "";
        }
        return;
      }

      if (
        this.realImages &&
        this.realImages.filePaths &&
        this.realImages.filePaths.length + files.length > maxFiles
      ) {
        this.isError = `You can upload a maximum of ${maxFiles} images.`;

        setTimeout(() => {
          this.isError = null;
        }, 5000);

        // Reset the input
        if (this.$refs.multipleImageInput) {
          this.$refs.multipleImageInput.value = "";
        }
        return;
      }

      // Process files through crop modal one by one
      this.processCroppedImages(files, 0, []);

      // Reset the input after processing starts
      if (this.$refs.multipleImageInput) {
        this.$refs.multipleImageInput.value = "";
      }
    },

    async processCroppedImages(files, index, croppedFiles) {
      if (index >= files.length) {
        // All files processed, now upload them
        const formData = new FormData();
        croppedFiles.forEach((file, i) => {
          formData.append("images", file);
        });
        this.uploadImages(formData);
        return;
      }

      // Open crop modal for current file
      this.openCropModalWithFile(files[index], 1, (croppedFile) => {
        croppedFiles.push(croppedFile);
        // Add delay before processing next file to allow modal cleanup
        setTimeout(() => {
          this.processCroppedImages(files, index + 1, croppedFiles);
        }, 500);
      });
    },
    removeRealImage(imageIndex) {
      const imageName = this.realImages.filePaths[imageIndex];
      console.log("Removing image:", imageName);
      this.removeImageFromServer(imageName);
    },

    removeImage(index) {
      const image = this.images[index];
      this.images = this.images.filter((img) => img !== image);
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
          this.realImages.filePaths = this.realImages.filePaths.filter(
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
          this.realImages = data.images;
          console.log("Real images:", this.realImages);

          this.isLoading = null;
          this.isSuccess = "Images uploaded successfully";

          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        } else {
          const errorText = await response.text();

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
    async loadSiteDetails() {
      this.isLoading = "Loading site data...";

      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/site-details?templateId=${this.templateId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          this.saveChanges();
        } else {
          const siteDetails = await response.json();
          // console.log("Site details", siteDetails);
          // this.title = siteDetails.details.title;

          this.aboutUsImages = siteDetails.details.aboutUsImages;
          this.carouselImages = siteDetails?.details?.carouselImages;
          this.aboutUsTitle = siteDetails.details.aboutUsTitle;
          this.aboutUsDescription = siteDetails.details.aboutUsDescription;
          this.hotelFoodTitle = siteDetails.details.hotelFoodTitle;
          this.hotelFoodDescription = siteDetails.details.hotelFoodDescription;
          this.hotelFoodImages = siteDetails.details.hotelFoodImages;
          this.imageRoomBradCam =
            siteDetails.details.imageRoomBradCam || "./img/banner/bradcam.png";
          this.imageAboutBradCam =
            siteDetails.details.imageAboutBradCam ||
            "./img/banner/bradcam2.png";
          this.imageContactBradCam =
            siteDetails.details.imageContactBradCam ||
            "./img/banner/bradcam3.png";
          this.mapIframeHtml =
            siteDetails.details.mapIframeHtml ||
            `<div style="max-width:100%;overflow:hidden;color:red;height:400px;"><div id="display-google-map" style="height:100%; width:100%;max-width:100%;"><iframe style="height:100%;width:100%;border:0;" frameborder="0" src="https://www.google.com/maps/embed/v1/place?q=hillroost&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"></iframe></div><a class="from-embedmap-code" href="https://www.bootstrapskins.com/themes" id="auth-map-data">premium bootstrap themes</a><style>#display-google-map img.text-marker{max-width:none!important;background:none!important;}img{max-width:none}</style></div>`;
          // this.email = siteDetails.details.email;
          // this.phoneNumber = siteDetails.details.phoneNumber;
          // this.address = siteDetails.details.address;
          if (siteDetails?.details?.realImages?.filePaths?.length > 0) {
            this.userUseRealImages = true;
            this.realImages = siteDetails.details.realImages;
          }

          this.isLoading = null;
          this.isSuccess = "Site details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error fetching site details:", error);
        this.isLoading = null;
        this.isError = "Error fetching site details";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    async saveChanges() {
      const data = {
        hotelId: this.hotelId,
        templateId: this.templateId,
        title: this.title,
        carouselImages: this.carouselImages,
        aboutUsTitle: this.aboutUsTitle,
        aboutUsDescription: this.aboutUsDescription,
        aboutUsImages: this.aboutUsImages,
        hotelFoodTitle: this.hotelFoodTitle,
        hotelFoodDescription: this.hotelFoodDescription,
        hotelFoodImages: this.hotelFoodImages,
        email: this.email,
        phoneNumber: this.phoneNumber,
        address: this.address,
        imageRoomBradCam: this.imageRoomBradCam,
        imageAboutBradCam: this.imageAboutBradCam,
        imageContactBradCam: this.imageContactBradCam,
        mapIframeHtml: this.mapIframeHtml,
        realImages: this.realImages,
      };
      this.isLoading = "Saving changes...";
      // console.log("Data to save:", data);
      try {
        const response = await fetch(
          "https://webtemplateapi.ceyinfo.com/temp2/save-site-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
          }
        );

        if (response.ok) {
          this.isLoading = null;
          this.isSuccess = "Changes saved successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        } else {
          this.isLoading = null;
          this.isError = "Failed to save changes";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        }
      } catch (error) {
        // console.error("Failed to save changes", error);
        this.isLoading = null;
        this.isError = "Failed to save changes";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    async loadRoomDetails() {
      this.isLoading = "Loading room data...";

      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/rooms-info`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.json();
          // console.error("Error loading room details:", errorText);
          this.isLoading = null;
          this.isError = errorText.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const roomDetails = await response.json();
          // console.log("Room details loaded successfully:", roomDetails);

          console.log(roomDetails);
          if (roomDetails.length < 0) {
            this.isLoading = null;
            this.isError = "Please add room your site";
            setTimeout(() => {
              this.isError = null;
            }, 5000);
          } else {
            this.roomsDetails = roomDetails.data;
            this.isLoading = null;
            this.isSuccess = "Room details loaded successfully";
            setTimeout(() => {
              this.isSuccess = null;
            }, 5000);
          }
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
        this.isLoading = null;
        this.isError = "Error fetching room details";
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
            console.log("result", result.data.orgId);
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
    async publishChanges() {
      this.isLoading = "Publishing...";

      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp2/build-template?hotelId=${this.hotelId}&templateId=${this.templateId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.json();
          console.error("Error publishing changes:", errorText);
          this.isLoading = null;
          this.isError = errorText.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          // console.log("Changes published successfully:", result);

          this.isLoading = null;
          this.isSuccess = "Changes published successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error publishing changes:", error);
        this.isLoading = null;
        this.isError = "Error publishing changes";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    async hotelOffers() {
      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/hotel-offers`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const err = await response.json();

          console.error("Error fetching hotel info:", errorText);

          this.isLoading = null;
          this.isError = err.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          // console.log(result?.data);

          // console.log("result", result?.data);

          if (result) {
            this.offers = result.data;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },

    // Crop functionality methods
    openCropModal(aspectRatio, callback) {
      console.log("Opening crop modal with aspect ratio:", aspectRatio);
      this.cropAspectRatio = aspectRatio;
      this.currentCropCallback = callback;

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
 
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.loadFileForCrop(file);
        }
      };

      fileInput.click();
    },

    openCropModalWithFile(file, aspectRatio, callback) {
      console.log(
        "Opening crop modal with file and aspect ratio:",
        aspectRatio
      );
      this.cropAspectRatio = aspectRatio;
      this.currentCropCallback = callback;
      this.loadFileForCrop(file);
    },

    loadFileForCrop(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.cropImageSrc = event.target.result;

        // Use Vue's nextTick to ensure DOM is updated
        this.$nextTick(() => {
          const modalElement = document.getElementById("imageCropModal");
          const modal = new bootstrap.Modal(modalElement);
          modal.show();

          // Initialize cropper after modal is shown
          modalElement.addEventListener(
            "shown.bs.modal",
            () => {
              setTimeout(() => {
                this.initializeCropper();
              }, 300);
            },
            { once: true }
          );
        });
      };
      reader.readAsDataURL(file);
    },

    initializeCropper() {
      const image = document.getElementById("cropImage");
      if (this.cropperInstance) {
        this.cropperInstance.destroy();
      }

      this.cropperInstance = new Cropper(image, {
        aspectRatio: this.cropAspectRatio,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        background: false,
        modal: true,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });
    },

    applyCrop() {
      if (!this.cropperInstance) {
        console.error("Cropper instance not found");
        return;
      }

      const canvas = this.cropperInstance.getCroppedCanvas({
        width: 1920,
        height: this.cropAspectRatio === 16 / 9 ? 1080 : 1920,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
          });

          if (this.currentCropCallback) {
            this.currentCropCallback(file);
          }

          this.closeCropModal();
        },
        "image/jpeg",
        0.95
      );
    },

    closeCropModal() {
      const modalElement = document.getElementById("imageCropModal");
      if (!modalElement) {
        return;
      }

      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // Clean up backdrop manually if it exists
      modalElement.addEventListener(
        "hidden.bs.modal",
        () => {
          const backdrop = document.querySelector(".modal-backdrop");
          if (backdrop) {
            backdrop.remove();
          }
          document.body.classList.remove("modal-open");
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
        },
        { once: true }
      );

      if (this.cropperInstance) {
        this.cropperInstance.destroy();
        this.cropperInstance = null;
      }

      this.cropImageSrc = "";
      this.currentCropCallback = null;
    },

    // Updated image upload methods with crop functionality
    uploadImageWithCrop(index) {
      this.openCropModal(16 / 9, (croppedFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.carouselImages[index].src = e.target.result;
        };
        reader.readAsDataURL(croppedFile);
      });
    },

    uploadAboutUsImageWithCrop(index) {
      this.openCropModal(9 / 16, (croppedFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.aboutUsImages[index].src = e.target.result;
        };
        reader.readAsDataURL(croppedFile);
      });
    },

    uploadHotelFoodImageWithCrop(index) {
      this.openCropModal(9 / 16, async (croppedFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.hotelFoodImages[index].src = e.target.result;
        };
        reader.readAsDataURL(croppedFile);
      });
    },
  },
  mounted() {
    this.loadSiteDetails();
    this.loadRoomDetails();
    this.hotelInfo();
    this.hotelOffers();
  },
});

app.mount("#app");
