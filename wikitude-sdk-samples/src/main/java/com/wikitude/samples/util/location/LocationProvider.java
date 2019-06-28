package com.wikitude.samples.util.location;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResponse;
import com.google.android.gms.location.SettingsClient;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.wikitude.architect.ArchitectView;
import com.wikitude.samples.MainActivity;
import com.wikitude.sdksamples.R;

import java.util.concurrent.Executor;

import static android.support.v4.content.ContextCompat.startActivity;


/**
 * Very basic location provider to enable location updates.
 * Please note that this approach is very minimal and we recommend to implement a more
 * advanced location provider for your app. (see https://developer.android.com/training/location/index.html)
 */
public class LocationProvider {

	private static final int REQUEST_CHECK_SETTINGS = 0;

	public static class ActivateGPSDialogFragment extends DialogFragment {

		/*public Dialog onCreateDialog(Bundle savedInstanceState, final LocationProvider provider) {
			// Use the Builder class for convenient dialog construction
			AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
			builder.setMessage("Estoy usando Google Play Service de localización")
					.setPositiveButton("ok", new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog, int id) {
						}
					})
					.setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog, int id) {
							// User cancelled the dialog
						}
					});
			// Create the AlertDialog object and return it
			return builder.create();
		}*/
	}

	private Context context;

	/** location listener called on each location update */
	private final @NonNull
	LocationListener locationListener;

	/** callback called when no providers are enabled */
	private final @NonNull
	ErrorCallback callback;

	/** system's locationManager allowing access to GPS / Network position */
	private FusedLocationProviderClient fusedLocationClient;

	private LocationCallback locationCallback;

	final LocationRequest locationRequest = LocationRequest.create();


	/** location updates should fire approximately 5 second */
	private static final int LOCATION_UPDATE_TIME = 5000;
	private static final int LOCATION_UPDATE_MIN_TIME = 3000;

	/** location updates should fire, even if last signal is same than current one (0m distance to last location is OK) */
	private static final int LOCATION_UPDATE_DISTANCE_GPS = 0;

	/** to faster access location, even use 10 minute old locations on start-up */
	private static final int LOCATION_OUTDATED_WHEN_OLDER_MS = 1000 * 60 * 10;


	public LocationProvider(@NonNull final Context context,
							@NonNull final LocationListener locationListener,
							@NonNull final ErrorCallback callback) {
		super();
		this.context = context;
		this.locationListener = locationListener;
		this.callback = callback;

		locationCallback = new LocationCallback() {
			@Override
			public void onLocationResult(LocationResult locationResult) {
				if (locationResult == null) {
					return;
				}
				for (Location location : locationResult.getLocations()) {
					locationListener.onLocationChanged(location);
				}
			}

			;
		};

		locationRequest.setInterval(LOCATION_UPDATE_TIME);
		locationRequest.setFastestInterval(LOCATION_UPDATE_MIN_TIME);
		locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

		LocationSettingsRequest.Builder builder = new LocationSettingsRequest.Builder()
				.addLocationRequest(locationRequest);


		SettingsClient client = LocationServices.getSettingsClient(context);
		Task<LocationSettingsResponse> task = client.checkLocationSettings(builder.build());

		task.addOnSuccessListener((Activity) context, new OnSuccessListener<LocationSettingsResponse>() {
			@Override
			public void onSuccess(LocationSettingsResponse locationSettingsResponse) {
				fusedLocationClient = LocationServices.getFusedLocationProviderClient(context);
				if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
					// TODO: Consider calling
					//    ActivityCompat#requestPermissions
					// here to request the missing permissions, and then overriding
					//   public void onRequestPermissionsResult(int requestCode, String[] permissions,
					//                                          int[] grantResults)
					// to handle the case where the user grants the permission. See the documentation
					// for ActivityCompat#requestPermissions for more details.
					return;
				}
				Task<Location> lastLocation = fusedLocationClient.getLastLocation();
				startLocationUpdates();
			}
		});

		task.addOnFailureListener((Activity) context, new OnFailureListener() {
			@Override
			public void onFailure(@NonNull Exception e) {
				if (e instanceof ResolvableApiException) {
					// Location settings are not satisfied, but this can be fixed
					// by showing the user a dialog.
					try {
						// Show the dialog by calling startResolutionForResult(),
						// and check the result in onActivityResult().
						ResolvableApiException resolvable = (ResolvableApiException) e;
						resolvable.startResolutionForResult((Activity) context,
								REQUEST_CHECK_SETTINGS);
					} catch (IntentSender.SendIntentException sendEx) {
						// Ignore the error.
					}
				} else {
                    callback.noProvidersEnabled();
                }
			}
		});

	}

	private void enableLocationSettings() {
		Intent settingsIntent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
		startActivity(this.context, settingsIntent, null);
	}

	public void onPause() {
		if (this.fusedLocationClient != null) {
			fusedLocationClient.removeLocationUpdates(locationCallback);

		}
	}

	@SuppressLint("MissingPermission")
	public void onResume() {
		if (this.fusedLocationClient != null) {

			// is GPS provider enabled?
			final Location lastKnownLocation = this.fusedLocationClient.getLastLocation().getResult();
			if (lastKnownLocation != null && lastKnownLocation.getTime() > System.currentTimeMillis() - LOCATION_OUTDATED_WHEN_OLDER_MS) {
				locationListener.onLocationChanged(lastKnownLocation);
				Log.println(Log.ASSERT, "Lucho", "Last knowed location lattitude:" + lastKnownLocation.getLatitude() + " Longitud:" + lastKnownLocation.getLongitude());
			}

			startLocationUpdates();
		}
	}

	public interface ErrorCallback {
		void noProvidersEnabled();
	}

	private void startLocationUpdates() {
		if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
			// TODO: Consider calling
			//    ActivityCompat#requestPermissions
			// here to request the missing permissions, and then overriding
			//   public void onRequestPermissionsResult(int requestCode, String[] permissions,
			//                                          int[] grantResults)
			// to handle the case where the user grants the permission. See the documentation
			// for ActivityCompat#requestPermissions for more details.
			return;
		}
		fusedLocationClient.requestLocationUpdates(locationRequest,
				locationCallback,
				null /* Looper */);
	}

}
