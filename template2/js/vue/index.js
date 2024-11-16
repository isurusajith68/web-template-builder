const app = Vue.createApp({
  data() {
    return {
      hotelId: 24,
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
    uploadAboutUsImage(event, index) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.aboutUsImages[index].src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
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

    async uploadImageRoomBradCam(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const imageDataUrl = await this.readFileAsync(file);
          this.imageRoomBradCam = imageDataUrl;
          await this.saveChanges();
        } catch (error) {
          console.error("Error reading file:", error);
        }
      }
    },
    triggerFileInputAboutUsBradCam() {
      this.$refs.fileInputAboutUs.click();
    },
    async uploadImageAboutUsBradCam(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const imageDataUrl = await this.readFileAsync(file);
          this.imageAboutBradCam = imageDataUrl;
          await this.saveChanges();
        } catch (error) {
          console.error("Error reading file:", error);
        }
      }
    },
    triggerFileInputContactBradCam() {
      this.$refs.fileInputContact.click();
    },
    async uploadImageContactBradCam(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const imageDataUrl = await this.readFileAsync(file);
          this.imageContactBradCam = imageDataUrl;
          await this.saveChanges();
        } catch (error) {
          console.error("Error reading file:", error);
        }
      }
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
      const files = event.target.files;
      const maxFiles = 5;

      if (files.length > maxFiles) {
        this.isError = `You can upload a maximum of ${maxFiles} images.`;

        setTimeout(() => {
          this.isError = null;
        }, 5000);
        return;
      }

      const formData = new FormData();

      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        formData.append("images", files[i]);
      }

      this.uploadImages(formData);
    },
    async uploadImages(formData) {
      this.isLoading = "Uploading...";

      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/upload-images?hotelId=${this.hotelId}&templateId=${this.templateId}`,
          {
            method: "POST",
            body: formData,
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
    async loadSiteDetails() {
      this.isLoading = "Loading site data...";

      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/site-details?hotelId=${this.hotelId}&templateId=${this.templateId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error loading site details:", errorText);
          this.isLoading = null;
          this.isError = "Error loading site details";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const siteDetails = await response.json();
          console.log("Site details loaded successfully:", siteDetails);
          this.title = siteDetails.details.title;

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
          if (siteDetails.details.realImages.getImgPathForTemplate.length > 0) {
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
      console.log("Data to save:", data);
      try {
        const response = await fetch(
          "https://be-publish.ceyinfo.cloud/temp2/save-site-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
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
        console.error("Failed to save changes", error);
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
          `https://be-publish.ceyinfo.cloud/rooms-info?hotelId=${this.hotelId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error loading room details:", errorText);
          this.isLoading = null;
          this.isError = "Error loading room details";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const roomDetails = await response.json();
          console.log("Room details loaded successfully:", roomDetails);
          this.roomsDetails = roomDetails;
          this.isLoading = null;
          this.isSuccess = "Room details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
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
          `https://be-publish.ceyinfo.cloud/hotel-info?hotelId=${this.hotelId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching hotel info:", errorText);
        } else {
          const result = await response.json();
          console.log("Hotel info fetched successfully:", result);

          if (result) {
            // this.title = result.name;
            this.email = result.email;
            this.phoneNumber = result.mobile;
            this.address = result.address1;
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
          `https://be-publish.ceyinfo.cloud/temp2/build-template?hotelId=${this.hotelId}&templateId=${this.templateId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error publishing changes:", errorText);
          this.isLoading = null;
          this.isError = "Error publishing changes";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          console.log("Changes published successfully:", result);

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
  },
  mounted() {
    this.loadSiteDetails();
    this.loadRoomDetails();
    // const urlParams = new URLSearchParams(window.location.search);
    // this.hotelId = urlParams.get("hotelId");
    // this.templateId = urlParams.get("templateId");
    // console.log(this.hotelId, this.templateId);
    this.hotelInfo();
  },
});

app.mount("#app");
