const gallery = Vue.createApp({
  data() {
    return {
      hotelId: null,
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
    };
  },

  methods: {
    handleFileChange(event) {
      console.log(event.target.files);
      const files = event.target.files;
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      this.uploadImages(formData);
    },

    removeRealImage(imageIndex) {
      const imageName = this.imageRows.flat()[imageIndex];
      this.removeImageFromServer(imageName);
    },

    async removeImageFromServer(imageName) {
      try {
        const response = await fetch(
          "https://be-publish.ceyinfo.cloud/remove-image",
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
          `https://be-publish.ceyinfo.cloud/upload-images?hotelId=${this.hotelId}&templateId=${this.templateId}`,
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
          `https://be-publish.ceyinfo.cloud/hotel-info?hotelId=${this.hotelId}`
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
            this.title = result.data.name;
            this.email = result.data.email;
            this.phoneNumber = result.data.mobile;
            this.address = result.data.address1;
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
          `https://be-publish.ceyinfo.cloud/site-details?hotelId=${this.hotelId}&templateId=${this.templateId}`
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

    // async hotelInfo() {
    //   try {
    //     const response = await fetch(
    //       `https://be-publish.ceyinfo.cloud/hotel-info?hotelId=${this.hotelId}`
    //     );

    //     if (!response.ok) {
    //       const errorText = await response.text();
    //       console.error("Error fetching hotel info:", errorText);
    //     } else {
    //       const result = await response.json();
    //       console.log("Hotel info fetched successfully:", result);

    //       if (result) {
    //         this.title = result.name;
    //         this.email = result.email;
    //         this.phoneNumber = result.mobile;
    //         this.address = result.address1;
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error fetching hotel info:", error);
    //   }
    // },
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
    const urlParams = new URLSearchParams(window.location.search);
    this.hotelId = urlParams.get("hotelId");

    if (
      !this.hotelId ||
      this.hotelId == "" ||
      this.hotelId == "null" ||
      this.hotelId == "undefined"
    ) {
      alert("Hotel ID not found in URL parameters.");
      window.location.href = "https://entry.ceyinfo.cloud";
    } else {
      this.loadSiteDetails();
      this.hotelInfo();
    }
  },
});

gallery.mount("#gallery");
