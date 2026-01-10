import Swal from "sweetalert2";

export async function DeleteAlert() {
    const result = await Swal.fire({
        allowOutsideClick: false,
        title: 'Are You Sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6', // fixed color
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
    });

    // Return true if user confirmed, false otherwise
    return result.isConfirmed;
}
